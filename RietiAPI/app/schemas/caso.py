from pydantic import BaseModel
from enum import Enum
from app.models.caso import Estado, Urgencia


class CasoCreate(BaseModel):
    id_municipio: int
    id_ubicacion: int
    estado: Estado | None = None
    notas: str | None = None
    urgencia: Urgencia | None = None


