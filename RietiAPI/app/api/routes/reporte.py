from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services import reporte_service
from app.schemas.reporte import ReporteCreate, ReporteResponse

router = APIRouter(prefix="/reportes")

@router.post(
    "/",
    response_model=ReporteResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_reporte(datos: ReporteCreate, db: Session = Depends(get_db)):
    return reporte_service.create_reporte(db, datos)
