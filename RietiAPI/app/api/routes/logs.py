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
    """Lista la bitácora de actividad, requiere rol Administrador

    Args:
        entity_type: tipo de registro por el que se filtra, todos si se omite
        limite: máximo de entradas a devolver, de 1 al máximo del servicio
        desplazamiento: entradas más recientes que se saltan, para paginar
        buscar: texto que se busca en el nombre del usuario, la acción o el id del registro
        db: sesión de base de datos

    Returns:
        Entradas de la bitácora de la más reciente a la más antigua

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 422 si limite o desplazamiento no son válidos
    """
    return logs_service.listar_logs(
        db=db,
        entity_type=entity_type,
        limite=limite,
        desplazamiento=desplazamiento,
        buscar=buscar,
    )
