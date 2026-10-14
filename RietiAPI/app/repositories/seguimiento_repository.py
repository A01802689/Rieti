from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.caso import Caso
from app.models.seguimiento import Seguimiento

def obtener_caso_para_seguimiento(db: Session, id_caso: int) -> Caso | None:
    return (
        db.query(Caso)
        .filter(Caso.id_caso == id_caso)
        .with_for_update()
        .first()
    )

def obtener_siguiente_consecutivo(db: Session, id_caso: int) -> int:
    ultimo = (
        db.query(func.max(Seguimiento.consecutivo))
        .filter(Seguimiento.id_caso == id_caso)
        .scalar()
    )
    return (ultimo or 0) + 1

