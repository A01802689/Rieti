from fastapi import HTTPException
from passlib.context import CryptContext
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.repositories import usuario_repository, municipio_repository, logs_repository
from app.models.logs import EntityType
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioCreateAdmin, UsuarioPermisosUpdate, RolEnum, PermisoEnum
from app.services import logs_service
#Llega un id_municipio. Si no existe, la FK hace que la BD truene.
#recibe objetos ya validado y ocnstruido, listo para usar

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _resumen_usuario(usuario: Usuario) -> dict:
    return {
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "id_municipio": usuario.id_municipio,
        "permisos": list(usuario.permisos or []),
    }


def _guardar_nuevo_usuario(db: Session, nuevo_usuario: Usuario, id_admin: int | None):
    try:
        usuario_repository.add(db, nuevo_usuario)
        if id_admin is not None:
            logs_service.registrar_log(
                db,
                id_admin,
                "Alta de usuario",
                EntityType.USUARIO,
                nuevo_usuario.id_usuario,
                {},
                _resumen_usuario(nuevo_usuario),
            )
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(nuevo_usuario)
    return nuevo_usuario


#create_usuario es específica para el registro desde la app pública
def create_usuario(db: Session, datos: UsuarioCreate, id_admin: int | None = None):
    correo = datos.correo.strip().lower()
    if usuario_repository.get_by_email(db, correo) is not None:
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=correo,
        contrasena_hash=pwd_context.hash(datos.contrasena),
    )
    return _guardar_nuevo_usuario(db, nuevo_usuario, id_admin)


def create_usuario_admin(db: Session, datos: UsuarioCreateAdmin | UsuarioCreate, id_admin: int | None = None):
    if datos.rol is None or datos.id_municipio is None:
        raise HTTPException(status_code=422, detail="El rol y el municipio son obligatorios para Administradores y Alimentadores")

    correo = datos.correo.strip().lower()
    if usuario_repository.get_by_email(db, correo) is not None:
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo")

    if municipio_repository.get_by_id(db, datos.id_municipio) is None:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    nuevo_usuario_admin = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=correo,
        rol=datos.rol,
        id_municipio=datos.id_municipio,
        contrasena_hash=pwd_context.hash(datos.contrasena),
        permisos=[] if datos.rol == RolEnum.administrador else _limpiar_permisos(datos.permisos),
    )
    return _guardar_nuevo_usuario(db, nuevo_usuario_admin, id_admin)


def login(db: Session, correo: str, contrasena: str):
    usuario = usuario_repository.get_by_email(db, correo)
    if usuario is None:
        return None
    if not pwd_context.verify(contrasena, usuario.contrasena_hash):
        return None
    usuario.ultimo_acceso = func.now()
    return usuario_repository.update(db, usuario)

def get_usuarios(db: Session):
    return usuario_repository.get_all(db)

def get_usuario(db: Session, id_usuario: int):
    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

def _limpiar_permisos(permisos: list) -> list[str]:
    return sorted({p.value for p in permisos if p != PermisoEnum.logs_view})

def update_permisos(db: Session, id_usuario: int, datos: UsuarioPermisosUpdate, id_admin: int):
    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o no es un Alimentador")

    if usuario.rol is None:
        raise HTTPException(status_code=400, detail="Los ciudadanos no tienen permisos del panel")

    if usuario.rol == "Administrador":
        raise HTTPException(status_code=400, detail="Los permisos del Administrador no se pueden editar")

    permisos_anteriores = sorted(usuario.permisos or [])
    permisos_nuevos = _limpiar_permisos(datos.permisos)
    try:
        usuario.permisos = permisos_nuevos
        if permisos_nuevos != permisos_anteriores:
            logs_service.registrar_log(
                db,
                id_admin,
                "Cambio de permisos",
                EntityType.USUARIO,
                id_usuario,
                {"permisos": permisos_anteriores},
                {"permisos": permisos_nuevos},
            )
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(usuario)
    return usuario

def delete_usuario(db: Session, id_usuario: int, id_admin: int):
    if id_usuario == id_admin:
        raise HTTPException(status_code=409, detail="Un administrador no puede eliminar su propia cuenta")

    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    resumen = _resumen_usuario(usuario)
    try:
        logs_repository.eliminar_por_usuario(db, id_usuario)
        usuario_repository.delete(db, id_usuario)
        logs_service.registrar_log(
            db,
            id_admin,
            "Baja de usuario",
            EntityType.USUARIO,
            id_usuario,
            resumen,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
