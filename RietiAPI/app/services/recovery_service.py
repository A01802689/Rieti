import logging
from datetime import datetime, timedelta, timezone
from typing import Callable, Literal
from urllib.parse import quote

from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories import password_reset_repository, usuario_repository
from app.services import email_service
from app.services.usuario_service import pwd_context
from app.utils import codes

# Reglas de la recuperación de contraseña. Une las piezas que ya hicimos:
#   utils/codes.py                              -> genera y hashea el código / token
#   repositories/password_reset_repository.py   -> guarda y busca las solicitudes en la base de datos
#   services/email_service.py                   -> manda el correo
# Flujo con código:  request_recovery(method="code")  ->  el usuario recibe 6 dígitos  ->  reset_with_code
# Flujo con enlace:  request_recovery(method="link")  ->  el usuario recibe un enlace   ->  reset_with_link

logger = logging.getLogger(__name__)

Method = Literal["code", "link"]


class InvalidRecovery(Exception):
    """El código o enlace no sirve"""


def _recovery_link(token: str) -> str:
    base = (settings.DASHBOARD_URL or settings.DASHBOARD_ORIGIN).rstrip("/")
    return f"{base}/recovery/token?token={quote(token)}"


def request_recovery(db: Session, *, email: str, method: Method) -> Callable[[], None] | None:
    """Crea la solicitud de recuperación y devuelve la función que manda el correo"""
    user = usuario_repository.get_by_email(db, email.strip())
    if user is None:
        return None

    if method == "code":
        secret = codes.generate_code()
        minutes = settings.RECOVERY_CODE_EXPIRE_MINUTES
    else:
        secret = codes.generate_token()
        minutes = settings.RECOVERY_LINK_EXPIRE_MINUTES

    # Solo se guarda el hash; el valor en claro únicamente viaja en el correo.
    # El repositorio invalida las solicitudes anteriores del usuario al crear la nueva.
    password_reset_repository.create(
        db,
        id_user=user.id_usuario,
        secret_hash=codes.hash_secret(secret),
        method=method,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
    )

    destiny = user.correo

    def send() -> None:
        try:
            if method == "code":
                email_service.send_recovery_code(destiny=destiny, code=secret, minutes=minutes)
            else:
                email_service.send_recovery_link(destiny=destiny, link=_recovery_link(secret), minutes=minutes)
        except email_service.EmailNotSent:
            # Se registra el fallo (sin el código ni el correo) y no se propaga: el usuario ya recibió la
            # respuesta genérica, y un error aquí no debe revelar nada ni romper la petición.
            logger.error("No se pudo enviar el correo de recuperación", exc_info=True)

    return send


def _change_password(db: Session, id_user: int, new_password: str) -> None:
    user = usuario_repository.get_by_id(db, id_user)
    if user is None:
        raise InvalidRecovery()
    user.contrasena_hash = pwd_context.hash(new_password)
    usuario_repository.update(db, user)


def reset_with_code(db: Session, *, email: str, code: str, new_password: str) -> None:
    """Cambia la contraseña con el código de 6 dígitos que llegó al correo.

    Raises:
        InvalidRecovery: el código no sirve (el motivo no se distingue a propósito).
    """
    user = usuario_repository.get_by_email(db, email.strip())
    if user is None:
        raise InvalidRecovery()

    request = password_reset_repository.get_active_by_user(db, user.id_usuario, method="code")
    if request is None or request.attempts >= settings.RECOVERY_MAX_ATTEMPTS:
        raise InvalidRecovery()

    # Un código de 6 dígitos se podría adivinar probando uno por uno; por eso cada fallo cuenta como intento
    # y al llegar al máximo la solicitud queda bloqueada (hay que pedir un código nuevo).
    if not codes.matches(code.strip(), request.secret_hash):
        password_reset_repository.add_attempt(db, request)
        raise InvalidRecovery()

    # mark_used devuelve False si otra petición ya gastó este código un instante antes (un solo uso).
    if not password_reset_repository.mark_used(db, request):
        raise InvalidRecovery()

    _change_password(db, user.id_usuario, new_password)


def reset_with_link(db: Session, *, token: str, new_password: str) -> None:
    request = password_reset_repository.get_active_by_hash(db, codes.hash_secret(token.strip()))
    if request is None or request.method != "link":
        raise InvalidRecovery()

    if not password_reset_repository.mark_used(db, request):
        raise InvalidRecovery()

    _change_password(db, request.id_user, new_password)
