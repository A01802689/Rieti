from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.caso import Caso
from app.models.seguimiento import Seguimiento

def obtener_caso_para_seguimiento(db: Session, id_caso: int) -> Caso | None:
    """Busca un caso bloqueando su fila para serializar los seguimientos nuevos

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        El caso bloqueado, o None si no existe
    """
    return (
        db.query(Caso)
        .filter(Caso.id_caso == id_caso)
        .with_for_update()
        .first()
    )

def obtener_siguiente_consecutivo(db: Session, id_caso: int) -> int:
    """Calcula el siguiente consecutivo de seguimiento de un caso

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        El consecutivo siguiente, 1 si el caso aún no tiene seguimientos
    """
    ultimo = (
        db.query(func.max(Seguimiento.consecutivo))
        .filter(Seguimiento.id_caso == id_caso)
        .scalar()
    )
    return (ultimo or 0) + 1

