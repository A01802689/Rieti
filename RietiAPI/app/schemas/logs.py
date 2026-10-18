from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.logs import EntityType


class LogResponse(BaseModel):
    id_logs: int
    id_usuario: int
    usuario: str
    action: str
    entity_type: EntityType
    id_registro_afectado: int
    before_data: dict[str, Any]
    after_data: dict[str, Any] | None = None
    fecha: datetime
