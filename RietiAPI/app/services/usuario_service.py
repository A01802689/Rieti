
from passlib.context import CryptContext
from app.repositories import usuario_repository
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



#create_usuario que acabamos de escribir es específica para el registro desde la app pública
def create_usuario(db: Session, datos: UsuarioCreate):
    contrasena_hash = pwd_context.hash(datos.contrasena)
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        correo=datos.correo,
        contrasena_hash=contrasena_hash,
        rol="Ciudadano"
    )
    return usuario_repository.create(db, nuevo_usuario)


def login(db: Session, correo: str, contrasena: str):
    usuario = usuario_repository.get_by_email(db, correo)
    if usuario is None:
        return None
    if not pwd_context.verify(contrasena, usuario.contrasena_hash):
        return None
    return usuario
