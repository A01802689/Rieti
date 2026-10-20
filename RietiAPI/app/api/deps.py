from collections.abc import Iterable

from app.api.permisos import MENSAJES_PERMISO
from app.db.session import SessionLocal
from fastapi import Request, HTTPException, Depends
from app.core.security import verify_token
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.repositories import usuario_repository
from app.schemas.reporte import ProyeccionReporte
from app.schemas.usuario import PermisoEnum

#: roles con acceso al panel, es decir todos los que no son ciudadano
ROLES_PERSONAL = ("Alimentador", "Administrador")



def get_db():
    """Abre una sesión de base de datos por petición y la cierra al terminar

    Yields:
        Sesión de SQLAlchemy lista para usarse en la petición
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Obtiene el usuario de la sesión a partir de la cookie access_token

    Args:
        request: petición HTTP de la que se lee la cookie
        db: sesión de base de datos con la que se busca al usuario

    Returns:
        Usuario autenticado, ciudadano o personal

    Raises:
        HTTPException: 401 si no hay cookie, si el token es inválido o expiró, o si el usuario ya no existe
    """
    token = request.cookies.get("access_token")
    if token is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=401, detail="Token inválido")
    usuario = usuario_repository.get_by_id(db, int(sub))
    if usuario is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario


def get_current_user_opcional(request: Request, db: Session = Depends(get_db)):
    """Obtiene el usuario de la sesión sin exigirla, para rutas públicas que cambian según quién llama

    Args:
        request: petición HTTP de la que se lee la cookie
        db: sesión de base de datos con la que se busca al usuario

    Returns:
        Usuario autenticado, o None si no hay sesión válida
    """
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None


def permisos_efectivos(usuario: Usuario) -> list[PermisoEnum]:
    """Calcula los permisos que realmente tiene un usuario

    El administrador tiene todos, el alimentador solo los guardados y válidos
    (sin logs.view, que es exclusivo del administrador) y el ciudadano ninguno

    Args:
        usuario: usuario del que se calculan los permisos

    Returns:
        Permisos efectivos en el orden de PermisoEnum
    """
    if usuario.rol == "Administrador":
        return list(PermisoEnum)
    if usuario.rol == "Alimentador":
        guardados = set(usuario.permisos or [])
        return [
            permiso for permiso in PermisoEnum
            if permiso.value in guardados and permiso != PermisoEnum.logs_view
        ]
    return []


def tiene_permiso(usuario: Usuario, *permisos: PermisoEnum) -> bool:
    """Indica si el usuario tiene al menos uno de los permisos dados

    Args:
        usuario: usuario a evaluar
        permisos: permisos aceptados, basta con tener uno

    Returns:
        True si tiene alguno de los permisos
    """
    efectivos = set(permisos_efectivos(usuario))
    return any(permiso in efectivos for permiso in permisos)


def proyeccion_reportes(usuario: Usuario, id_caso: int | None) -> ProyeccionReporte:
    """Decide qué campos del listado de reportes puede ver el usuario

    Args:
        usuario: usuario que consulta el listado
        id_caso: caso por el que se filtra el listado, si lo hay

    Returns:
        CIUDADANO para quien no es personal, COMPLETA con reports.view, reports.view_detail
        o cases.view al filtrar por caso, y REDUCIDA en cualquier otro caso
    """
    if usuario.rol is None:
        return ProyeccionReporte.CIUDADANO
    if tiene_permiso(usuario, PermisoEnum.reports_view, PermisoEnum.reports_view_detail):
        return ProyeccionReporte.COMPLETA
    if id_caso is not None and tiene_permiso(usuario, PermisoEnum.cases_view):
        return ProyeccionReporte.COMPLETA
    return ProyeccionReporte.REDUCIDA


def exigir_personal(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Dependencia que exige sesión de personal, es decir alimentador o administrador

    Args:
        usuario: usuario de la sesión

    Returns:
        Usuario de la sesión

    Raises:
        HTTPException: 401 si no hay sesión válida, 403 si el usuario es ciudadano
    """
    if usuario.rol not in ROLES_PERSONAL:
        raise HTTPException(status_code=403, detail="Acceso sólo para personal autorizado")
    return usuario


def exigir_administrador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Dependencia que exige sesión de administrador

    Args:
        usuario: usuario de la sesión

    Returns:
        Usuario de la sesión

    Raises:
        HTTPException: 401 si no hay sesión válida, 403 si el usuario no es administrador
    """
    if usuario.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede realizar esta acción")
    return usuario


def exigir_alguno(usuario: Usuario, *permisos: PermisoEnum) -> None:
    """Exige que el usuario tenga al menos uno de los permisos, para reglas que dependen del cuerpo o del rol

    Args:
        usuario: usuario a evaluar
        permisos: permisos aceptados, el mensaje del 403 es el del primero

    Raises:
        HTTPException: 403 si no tiene ninguno de los permisos
    """
    if not tiene_permiso(usuario, *permisos):
        raise HTTPException(status_code=403, detail=MENSAJES_PERMISO[permisos[0]])


def exigir_todos(usuario: Usuario, permisos: Iterable[PermisoEnum]) -> None:
    """Exige que el usuario tenga cada uno de los permisos, revisándolos en el orden de PermisoEnum

    Args:
        usuario: usuario a evaluar
        permisos: permisos que debe tener todos

    Raises:
        HTTPException: 403 con el mensaje del primer permiso que le falte
    """
    requeridos = set(permisos)
    for permiso in PermisoEnum:
        if permiso in requeridos:
            exigir_alguno(usuario, permiso)


def exigir_permiso(*permisos: PermisoEnum):
    """Crea una dependencia que exige personal con al menos uno de los permisos dados

    Args:
        permisos: permisos aceptados, basta con tener uno

    Returns:
        Dependencia de FastAPI que devuelve al usuario de la sesión
    """
    def dependencia(usuario: Usuario = Depends(exigir_personal)) -> Usuario:
        """Valida el permiso sobre el usuario de la sesión

        Args:
            usuario: usuario de la sesión, ya validado como personal

        Returns:
            Usuario de la sesión

        Raises:
            HTTPException: 401 sin sesión válida, 403 si no es personal o le falta el permiso
        """
        exigir_alguno(usuario, *permisos)
        return usuario

    return dependencia
