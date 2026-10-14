from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.caso import AbrirCasoDesdeReporte, CasoAbiertoResponse
from app.services import caso_service

router = APIRouter(prefix="/reportes", tags=["Casos"])


@router.post(
    "/{id_reporte}/abrir-caso",
    response_model=CasoAbiertoResponse,
    status_code=status.HTTP_201_CREATED,
)
def abrir_caso(
    id_reporte: int,
    datos: AbrirCasoDesdeReporte,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede abrir casos")

    return caso_service.abrir_caso_desde_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
    )