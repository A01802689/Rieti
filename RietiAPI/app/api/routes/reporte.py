from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services import reporte_service
from app.schemas.reporte import ReporteCreate
from app.models.reporte import Reporte
from app.core.security import create_access_token

router = APIRouter(prefix="/reportes")

@router.post("/", response_model=ReporteCreate)
def crear_reporte(datos: ReporteCreate, db: Session = Depends(get_db)):
    return reporte_service.create_reporte(db, datos)

