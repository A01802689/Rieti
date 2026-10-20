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

#: Contexto de hash de contraseñas con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _resumen_usuario(usuario: Usuario) -> dict:
    """Resume los datos de un usuario sin contraseña para guardarlos en la bitácora

    Args:
        usuario: usuario a resumir

    Returns:
        Diccionario con identificador, nombre, correo, rol, municipio y permisos
    """
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
    """Guarda un usuario nuevo y, si lo da de alta un administrador, registra el alta en la bitácora

    Args:
        db: sesión de base de datos
        nuevo_usuario: usuario ya construido
        id_admin: identificador del administrador que lo da de alta, None si es un registro público

    Returns:
        El usuario guardado
    """
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
    """Registra un ciudadano, sin rol, municipio ni permisos

    Args:
        db: sesión de base de datos
        datos: nombre, apellido, correo y contraseña
        id_admin: identificador del administrador que lo da de alta, None si es un registro público

    Returns:
        El ciudadano creado

    Raises:
        HTTPException: 409 si ya existe una cuenta con ese correo
    """
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
    """Crea un Administrador o un Alimentador con municipio y permisos

    Los permisos solo se guardan para Alimentadores

    Args:
        db: sesión de base de datos
        datos: datos del usuario, con rol y municipio obligatorios
        id_admin: identificador del administrador que lo da de alta

    Returns:
        El usuario creado

    Raises:
        HTTPException: 422 si falta el rol o el municipio
        HTTPException: 409 si ya existe una cuenta con ese correo
        HTTPException: 404 si el municipio no existe
    """
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
    """Valida las credenciales y actualiza la fecha del último acceso

    Args:
        db: sesión de base de datos
        correo: correo de la cuenta
        contrasena: contraseña en texto plano

    Returns:
        El usuario autenticado, o None si el correo no existe o la contraseña no coincide
    """
    usuario = usuario_repository.get_by_email(db, correo)
    if usuario is None:
        return None
    if not pwd_context.verify(contrasena, usuario.contrasena_hash):
        return None
    usuario.ultimo_acceso = func.now()
    return usuario_repository.update(db, usuario)

def get_usuarios(db: Session):
    """Lista los usuarios del panel (con rol) ordenados por apellido y nombre

    Args:
        db: sesión de base de datos

    Returns:
        Los usuarios con su municipio cargado
    """
    return usuario_repository.get_all(db)

def get_usuario(db: Session, id_usuario: int):
    """Obtiene un usuario por su identificador

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario

    Returns:
        El usuario

    Raises:
        HTTPException: 404 si no existe
    """
    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

def _limpiar_permisos(permisos: list) -> list[str]:
    """Normaliza los permisos a guardar: sin repetidos, ordenados y sin logs.view

    Args:
        permisos: permisos recibidos

    Returns:
        Los valores de texto de los permisos que se guardan
    """
    return sorted({p.value for p in permisos if p != PermisoEnum.logs_view})

def update_permisos(db: Session, id_usuario: int, datos: UsuarioPermisosUpdate, id_admin: int):
    """Reemplaza los permisos de un Alimentador y registra el cambio si hubo diferencia

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario a modificar
        datos: lista completa de permisos nuevos
        id_admin: identificador del administrador que hace el cambio

    Returns:
        El usuario con sus permisos actualizados

    Raises:
        HTTPException: 404 si el usuario no existe
        HTTPException: 400 si es ciudadano o Administrador, cuyos permisos no se editan
    """
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
    """Elimina un usuario junto con sus datos dependientes y registra la baja

    Borra su bitácora, sus seguimientos y asignaciones, y deja sin usuario los reportes que creó

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario a eliminar
        id_admin: identificador del administrador que elimina

    Raises:
        HTTPException: 409 si el administrador intenta eliminar su propia cuenta
        HTTPException: 404 si el usuario no existe
    """
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
