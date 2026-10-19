from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import exigir_administrador, get_db
from app.models.logs import EntityType
from app.schemas.logs import LogResponse
from app.services import logs_service

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get(
    "",
    response_model=list[LogResponse],
    dependencies=[Depends(exigir_administrador)],
)
def listar_logs(
    entity_type: EntityType | None = None,
    limite: int = Query(100, ge=1, le=logs_service.LIMITE_MAXIMO),
    desplazamiento: int = Query(0, ge=0),
    buscar: str | None = None,
    db: Session = Depends(get_db),
):
    return logs_service.listar_logs(
        db=db,
        entity_type=entity_type,
        limite=limite,
        desplazamiento=desplazamiento,
        buscar=buscar,
    )
