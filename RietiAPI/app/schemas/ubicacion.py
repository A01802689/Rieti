from pydantic import BaseModel
from enum import Enum

class UbicacionCreate(BaseModel):
    municipio: str
    colonia: str
    calle: str
    longitud: float
    latitud: float
    referencia: str | None = None


