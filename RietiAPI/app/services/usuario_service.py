from passlib.context import CryptContext
from app.repositories import usuario_repository
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioCreateAdmin
from sqlalchemy.orm import Session

#recibe objetos ya validado y ocnstruido, listo para usar

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#create_usuario es específica para el registro desde la app pública
def create_usuario(db: Session, datos: UsuarioCreate):
    contrasena_hash = pwd_context.hash(datos.contrasena)
    nuevo_usuario = Usuario (
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=datos.correo,
        contrasena_hash=contrasena_hash,
    )
    return usuario_repository.create(db, nuevo_usuario)


def create_usuario_admin(db: Session, datos: UsuarioCreateAdmin):
    contrasena_hash = pwd_context.hash(datos.contrasena)
    nuevo_usuario_admin = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo=datos.correo,
        rol=datos.rol,
        id_municipio=datos.id_municipio,
        contrasena_hash=contrasena_hash
    )
    return usuario_repository.create(db, nuevo_usuario_admin)

def login(db: Session, correo: str, contrasena: str):
    usuario = usuario_repository.get_by_email(db, correo)
    if usuario is None:
        return None
    if not pwd_context.verify(contrasena, usuario.contrasena_hash):
        return None
    return usuario
