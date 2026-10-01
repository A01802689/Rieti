from sqlalchemy.orm import Session
from app.models.reporte import Reporte

def create(db: Session, reporte: Reporte):
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte
    
