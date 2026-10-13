from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.reporte import ReporteCreate, ReporteResponse
from app.services import reporte_service

router = APIRouter(prefix="/reportes")


@router.post(
    "/",
    response_model=ReporteResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_reporte(
    datos: ReporteCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    
    """if usuario_actual.rol is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sólo los usuarios sin rol pueden crear reportes",
        )"""

    return reporte_service.create_reporte(
        db=db,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )