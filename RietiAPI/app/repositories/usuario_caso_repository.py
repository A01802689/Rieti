from sqlalchemy.orm import Session
from app.models.usuario_caso import UsuarioCaso

def create_usuario_caso(db: Session, usuario_caso: UsuarioCaso) -> UsuarioCaso:
    """Guarda y confirma una asignación de usuario a caso

    Args:
        db: sesión de base de datos
        usuario_caso: asignación ya construida

    Returns:
        La asignación guardada
    """
    db.add(usuario_caso)
    db.commit()
    db.refresh(usuario_caso)
    return usuario_caso

def get_by_id(db: Session, id_usuario_caso: int) -> UsuarioCaso | None:
    """Busca una asignación por su identificador

    Args:
        db: sesión de base de datos
        id_usuario_caso: identificador de la asignación

    Returns:
        La asignación, o None si no existe
    """
    return db.get(UsuarioCaso, id_usuario_caso)


