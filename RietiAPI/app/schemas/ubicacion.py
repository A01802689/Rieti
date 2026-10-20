from pydantic import BaseModel
from enum import Enum

class UbicacionCreate(BaseModel):
    """Ubicación capturada al crear un reporte

    Attributes:
        municipio: nombre exacto del municipio del catálogo
        longitud: grados
        latitud: grados
    """
    municipio: str
    colonia: str
    calle: str
    longitud: float
    latitud: float
    referencia: str | None = None


