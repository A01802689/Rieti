from datetime import datetime
from app.schemas.fechas import FechaUTC


from pydantic import BaseModel


from enum import Enum


class TipoSeguimiento(str, Enum):
    """Clasificación de una nota de seguimiento"""
    RECEPCION_REPORTE = "Recepción de reporte"
    NOTA = "Nota"
    CAMBIO_ESTADO = "Cambio de estado"
    TRANSFERENCIA = "Transferencia"


class SeguimientoResponse(BaseModel):
    """Nota de la línea de tiempo de un caso

    Attributes:
        autor: nombre completo de quien la escribió
    """
    folio: str
    fecha: FechaUTC
    tipo: TipoSeguimiento
    autor: str
    nota: str

class SeguimientoCreate(BaseModel):
    """Nota que se agrega a un caso"""
    nota: str
    tipo: TipoSeguimiento
