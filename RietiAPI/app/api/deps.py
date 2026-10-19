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

ROLES_PERSONAL = ("Alimentador", "Administrador")



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        
def get_current_user(request: Request, db: Session = Depends(get_db)):
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
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None


def permisos_efectivos(usuario: Usuario) -> list[PermisoEnum]:
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
    efectivos = set(permisos_efectivos(usuario))
    return any(permiso in efectivos for permiso in permisos)


def proyeccion_reportes(usuario: Usuario, id_caso: int | None) -> ProyeccionReporte:
    if usuario.rol is None:
        return ProyeccionReporte.CIUDADANO
    if tiene_permiso(usuario, PermisoEnum.reports_view, PermisoEnum.reports_view_detail):
        return ProyeccionReporte.COMPLETA
    if id_caso is not None and tiene_permiso(usuario, PermisoEnum.cases_view):
        return ProyeccionReporte.COMPLETA
    return ProyeccionReporte.REDUCIDA


def exigir_personal(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.rol not in ROLES_PERSONAL:
        raise HTTPException(status_code=403, detail="Acceso sólo para personal autorizado")
    return usuario


def exigir_administrador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede realizar esta acción")
    return usuario


def exigir_alguno(usuario: Usuario, *permisos: PermisoEnum) -> None:
    if not tiene_permiso(usuario, *permisos):
        raise HTTPException(status_code=403, detail=MENSAJES_PERMISO[permisos[0]])


def exigir_todos(usuario: Usuario, permisos: Iterable[PermisoEnum]) -> None:
    requeridos = set(permisos)
    for permiso in PermisoEnum:
        if permiso in requeridos:
            exigir_alguno(usuario, permiso)


def exigir_permiso(*permisos: PermisoEnum):
    def dependencia(usuario: Usuario = Depends(exigir_personal)) -> Usuario:
        exigir_alguno(usuario, *permisos)
        return usuario

    return dependencia
