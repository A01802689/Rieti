import logging
from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.logs import EntityType, Log
from app.repositories import logs_repository
from app.schemas.logs import LogResponse

LIMITE_MAXIMO = 500

logger = logging.getLogger(__name__)


def listar_logs(
    *,
    db: Session,
    entity_type: EntityType | None = None,
    limite: int = 100,
    desplazamiento: int = 0,
    buscar: str | None = None,
) -> list[LogResponse]:
    filas = logs_repository.listar(
        db,
        entity_type=entity_type,
        limite=limite,
        desplazamiento=desplazamiento,
        buscar=buscar.strip() if buscar else None,
    )
    return [
        LogResponse(
            id_logs=fila.id_logs,
            id_usuario=fila.id_usuario,
            usuario=fila.usuario,
            action=fila.action,
            entity_type=fila.entity_type,
            id_registro_afectado=fila.id_registro_afectado,
            before_data=fila.before_data,
            after_data=fila.after_data,
            fecha=fila.fecha,
        )
        for fila in filas
    ]


def registrar_log(
    db: Session,
    id_usuario: int,
    action: str,
    entity_type: EntityType | str,
    id_registro_afectado: int,
    before_data: dict[str, Any],
    after_data: dict[str, Any] | None = None,
) -> Log | None:
    action = action.strip()
    if not action:
        raise ValueError("La acción del log no puede estar vacía")
    entity_type = EntityType(entity_type.lower())
    before_data = jsonable_encoder(before_data)
    after_data = jsonable_encoder(after_data) if after_data is not None else None

    db.flush()
    try:
        with db.begin_nested():
            return logs_repository.registrar(
                db,
                id_usuario=id_usuario,
                action=action,
                entity_type=entity_type,
                id_registro_afectado=id_registro_afectado,
                before_data=before_data,
                after_data=after_data,
            )
    except SQLAlchemyError:
        logger.exception(
            "No se pudo registrar el log '%s' de %s %s",
            action,
            entity_type.value,
            id_registro_afectado,
        )
        return None
