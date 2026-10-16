from fastapi import HTTPException
from passlib.context import CryptContext
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.repositories import usuario_repository, municipio_repository
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioCreateAdmin, UsuarioPermisosUpdate, RolEnum
#Llega un id_municipio. Si no existe, la FK hace que la BD truene.
#recibe objetos ya validado y ocnstruido, listo para usar

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#create_usuario es específica para el registro desde la app pública
def create_usuario(db: Session, datos: UsuarioCreate):
    if usuario_repository.get_by_email(db, datos.correo) is not None:
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo")

    contrasena_hash = pwd_context.hash(datos.contrasena)
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=datos.correo.strip().lower(),
        contrasena_hash=contrasena_hash,
    )
    return usuario_repository.create(db, nuevo_usuario)


def create_usuario_admin(db: Session, datos: UsuarioCreateAdmin):
    if usuario_repository.get_by_email(db, datos.correo) is not None:
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo")

    if municipio_repository.get_by_id(db, datos.id_municipio) is None:
        raise HTTPException(status_code=404, detail="Municipio no encontrado")

    contrasena_hash = pwd_context.hash(datos.contrasena)
    nuevo_usuario_admin = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=datos.correo.strip().lower(),
        rol=datos.rol,
        id_municipio=datos.id_municipio,
        contrasena_hash=pwd_context.hash(datos.contrasena),
        permisos=[] if datos.rol == RolEnum.administrador else _limpiar_permisos(datos.permisos),
    )
    return usuario_repository.create(db, nuevo_usuario_admin)


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

def _limpiar_permisos(permisos: list) -> list[str]:
    return sorted({p.value for p in permisos})

def update_permisos(db: Session, id_usuario: int, datos: UsuarioPermisosUpdate):
    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o no es un Alimentador")

    if usuario.rol is None:
        raise HTTPException(status_code=400, detail="Los ciudadanos no tienen permisos del panel")

    if usuario.rol == "Administrador":
        raise HTTPException(status_code=400, detail="Los permisos del Administrador no se pueden editar")

    usuario.permisos = _limpiar_permisos(datos.permisos)
    return usuario_repository.update(db, usuario)