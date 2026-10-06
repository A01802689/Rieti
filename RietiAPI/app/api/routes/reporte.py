from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services import reporte_service
from app.schemas.reporte import ReporteCreate, ReporteResponse

router = APIRouter(prefix="/reportes")

@router.post("/", response_model=ReporteResponse)
def crear_reporte(datos: ReporteCreate, db: Session = Depends(get_db)):
    return reporte_service.create_reporte(db, datos)

