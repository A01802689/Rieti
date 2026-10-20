import logging
from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.logs import EntityType, Log
from app.repositories import logs_repository
from app.schemas.logs import LogResponse

#: Máximo de entradas de bitácora por consulta
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
    """Lista las entradas de la bitácora, de la más reciente a la más antigua

    Args:
        db: sesión de base de datos
        entity_type: tipo de entidad para filtrar, None para todos
        limite: máximo de entradas a devolver
        desplazamiento: entradas a saltar para paginar
        buscar: texto a buscar en el nombre del usuario, la acción o el registro afectado

    Returns:
        Las entradas de la bitácora con el nombre de quien actuó
    """
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
    """Registra una entrada en la bitácora dentro de la transacción en curso

    La inserción va en un SAVEPOINT: si falla se registra el error y la operación principal continúa sin bitácora

    Args:
        db: sesión de base de datos
        id_usuario: identificador de quien realizó la acción
        action: descripción de la acción, no puede quedar vacía
        entity_type: tipo de entidad afectada, enum o su texto en cualquier capitalización
        id_registro_afectado: identificador del registro afectado
        before_data: valores anteriores
        after_data: valores nuevos, None si no aplica

    Returns:
        La entrada creada, o None si no se pudo guardar

    Raises:
        ValueError: si la acción queda vacía o el tipo de entidad no existe
    """
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
