from datetime import datetime
from app.schemas.fechas import FechaUTC
from typing import Any

from pydantic import BaseModel

from app.models.logs import EntityType


class LogResponse(BaseModel):
    """Entrada de la bitácora

    Attributes:
        usuario: nombre completo de quien realizó la acción
        before_data: valores anteriores
        after_data: valores posteriores, None si no aplica
        fecha: momento de la acción en UTC sin zona horaria
    """
    id_logs: int
    id_usuario: int
    usuario: str
    action: str
    entity_type: EntityType
    id_registro_afectado: int
    before_data: dict[str, Any]
    after_data: dict[str, Any] | None = None
    fecha: FechaUTC
