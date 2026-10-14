from datetime import datetime


from pydantic import BaseModel


from enum import Enum


class TipoSeguimiento(str, Enum):
    RECEPCION_REPORTE = "Recepción de reporte"
    NOTA = "Nota"
    CAMBIO_ESTADO = "Cambio de estado"
    TRANSFERENCIA = "Transferencia"


class SeguimientoResponse(BaseModel):
    folio: str
    fecha: datetime
    tipo: TipoSeguimiento
    autor: str
    nota: str

class SeguimientoCreate(BaseModel):
    nota: str
    tipo: TipoSeguimiento
