from sqlalchemy.orm import Session

from app.models.caso import Caso

def get_by_id(db: Session, id_caso: int) -> Caso | None:
    return db.get(Caso, id_caso)