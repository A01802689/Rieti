from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import exigir_permiso, get_db
from app.models.usuario import Usuario
from app.schemas.seguimiento import SeguimientoCreate, SeguimientoResponse
from app.schemas.usuario import PermisoEnum
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
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.cases_edit)),
):
    return seguimiento_service.crear_seguimiento(
        db=db,
        id_caso=id_caso,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )