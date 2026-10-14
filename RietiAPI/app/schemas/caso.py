from pydantic import BaseModel, Field
from enum import Enum
from app.models.caso import Estado, Urgencia


class CasoCreate(BaseModel):
    id_municipio: int
    id_ubicacion: int
    estado: Estado | None = None
    notas: str | None = None
    urgencia: Urgencia | None = None


class UbicacionCasoCreate(BaseModel):
    colonia: str = Field(min_length=1, max_length=100)
    calle: str = Field(min_length=1, max_length=100)
    longitud: float = Field(ge=-180, le=180)
    latitud: float = Field(ge=-90, le=90)
    referencia: str | None = None


class AbrirCasoDesdeReporte(BaseModel):
    id_municipio: int
    ubicacion: UbicacionCasoCreate
    urgencia: Urgencia


class CasoAbiertoResponse(BaseModel):
    id_caso: int
    id_reporte: int
    id_municipio: int
    id_ubicacion: int
    estado: Estado
    urgencia: Urgencia


