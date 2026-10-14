from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.seguimiento import SeguimientoCreate, SeguimientoResponse
from app.services import seguimiento_service

router = APIRouter(prefix="/casos", tags=["Seguimiento"])


@router.post(
    "/{id_caso}/seguimientos",
    response_model=SeguimientoResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_seguimiento(
    id_caso: int,
    datos: SeguimientoCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    if usuario_actual.rol not in ("Alimentador", "Administrador"):
        raise HTTPException(status_code=403, detail="No tienes permiso para añadir notas")

    return seguimiento_service.crear_seguimiento(
        db=db,
        id_caso=id_caso,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )