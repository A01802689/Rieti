from sqlalchemy.orm import Session, joinedload
from app.models.usuario import Usuario #importo el molde
from app.models.reporte import Reporte
from app.models.seguimiento import Seguimiento
from app.models.usuario_caso import UsuarioCaso
from sqlalchemy import func


def get_by_id(db: Session, id_usuario: int):
    """Busca un usuario por su identificador

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario

    Returns:
        El usuario, o None si no existe
    """
    return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
#quiero ahcer una consulta sobre la tabla Usuario
#dame las filas sonde las columas dle id_usario sea igual al valor que me dieron en el parametro
# regresa el primer resulado que coincida 

def get_by_email(db: Session, email: str):
    """Busca un usuario por correo sin distinguir mayúsculas

    Args:
        db: sesión de base de datos
        email: correo a buscar

    Returns:
        El usuario, o None si no existe
    """
    return db.query(Usuario).filter(func.lower(Usuario.correo) == email.lower()).first()

#ya usuario ya como objeto de la clase Usuario
def add(db: Session, usuario: Usuario):
    """Agrega un usuario a la sesión y lo envía a la base sin confirmar la transacción

    Args:
        db: sesión de base de datos
        usuario: usuario ya construido

    Returns:
        El usuario con su identificador asignado
    """
    db.add(usuario)
    db.flush()
    return usuario

def update(db: Session, usuario: Usuario):
    """Confirma los cambios pendientes de un usuario y lo recarga

    Args:
        db: sesión de base de datos
        usuario: usuario ya modificado

    Returns:
        El usuario actualizado
    """
    db.commit()
    db.refresh(usuario)
    return usuario


#dependiendo del borrar usarios los admin
def delete(db: Session, id_usuario: int):
    """Elimina un usuario junto con sus seguimientos y asignaciones, y deja sin usuario sus reportes

    No confirma la transacción

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario

    Returns:
        Número de usuarios eliminados
    """
    db.query(Seguimiento).filter(Seguimiento.id_usuario_autor == id_usuario).delete(synchronize_session=False)
    db.query(UsuarioCaso).filter(UsuarioCaso.id_usuario == id_usuario).delete(synchronize_session=False)
    db.query(Reporte).filter(Reporte.id_usuario == id_usuario).update(
        {Reporte.id_usuario: None}, synchronize_session=False
    )
    return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).delete()


def get_all(db: Session):
    """Lista los usuarios del panel (con rol) ordenados por apellido y nombre

    Args:
        db: sesión de base de datos

    Returns:
        Los usuarios con su municipio cargado
    """
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.municipio))
        .filter(Usuario.rol.isnot(None))
        .order_by(Usuario.apellido, Usuario.nombre)
        .all()
    )


