from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator
from app.models.caso import Estado, Urgencia
from app.models.reporte import CantidadNNA, EdadAproximada, EstatusSeguimiento, TipoTrabajo
from app.schemas.seguimiento import SeguimientoResponse


class ContratoCantidadCaso(BaseModel):
    @field_validator("cantidad_nna", mode="before", check_fields=False,
                     json_schema_input_type=Literal[1, 2, 3, 4, "1", "2", "3", "4", "5 o más", "No sé"])
    @classmethod
    def normalizar_cantidad(cls, valor):
        return str(valor) if type(valor) is int else valor

    @field_serializer("cantidad_nna", check_fields=False, when_used="unless-none")
    def serializar_cantidad(self, valor) -> Literal[1, 2, 3, 4, "5 o más", "No sé"]:
        return int(valor.value) if valor.value in ("1", "2", "3", "4") else valor.value


class DatosCaso(ContratoCantidadCaso):
    cantidad_nna: CantidadNNA
    edad_aproximada: EdadAproximada
    tipo_trabajo: TipoTrabajo


class CasoCreate(ContratoCantidadCaso):
    id_municipio: int
    id_ubicacion: int
    estado: Estado | None = None
    urgencia: Urgencia | None = None
    cantidad_nna: CantidadNNA = CantidadNNA.NO_SE
    edad_aproximada: EdadAproximada = EdadAproximada.NO_SE
    tipo_trabajo: TipoTrabajo = TipoTrabajo.NO_SE


class UbicacionCasoCreate(BaseModel):
    colonia: str = Field(min_length=1, max_length=100)
    calle: str = Field(min_length=1, max_length=100)
    longitud: float = Field(ge=-180, le=180)
    latitud: float = Field(ge=-90, le=90)
    referencia: str | None = None


class AbrirCasoDesdeReporte(BaseModel):
    id_municipio: int | None = None
    ubicacion: UbicacionCasoCreate | None = None
    urgencia: Urgencia | None = None


class CasoAbiertoResponse(DatosCaso):
    id_caso: int
    id_reporte: int
    id_municipio: int
    id_ubicacion: int
    estado: Estado
    urgencia: Urgencia | None
    estatus_seguimiento: EstatusSeguimiento


class MunicipioCasoResponse(BaseModel):
    nombre: str


class UbicacionCasoResponse(BaseModel):
    municipio: str
    colonia: str | None
    calle: str | None
    lat: float | None
    lng: float | None


class CasoListado(DatosCaso):
    id_caso: int
    municipio: MunicipioCasoResponse
    ubicacion: UbicacionCasoResponse
    estado: Estado | None
    fecha_caso: datetime
    urgencia: Urgencia | None
    cantidad_reportes: int


class CasoDetalle(CasoListado):
    notas: str | None
    seguimientos: list[SeguimientoResponse]


class ActualizarUbicacionCaso(BaseModel):
    model_config = ConfigDict(extra="forbid")
    colonia: str | None = Field(default=None, min_length=1, max_length=100)
    calle: str | None = Field(default=None, min_length=1, max_length=100)
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    referencia: str | None = None

    @model_validator(mode="after")
    def validar_coordenadas(self):
        if (self.lat is None) != (self.lng is None):
            raise ValueError("lat y lng deben enviarse juntos")
        return self


class ActualizarCaso(ContratoCantidadCaso):
    model_config = ConfigDict(extra="forbid")
    estado: Estado | None = None
    urgencia: Urgencia | None = None
    cantidad_nna: CantidadNNA | None = None
    edad_aproximada: EdadAproximada | None = None
    tipo_trabajo: TipoTrabajo | None = None
    ubicacion: ActualizarUbicacionCaso | None = None

    @field_validator("cantidad_nna", mode="before",
                     json_schema_input_type=Literal[1, 2, 3, 4, "1", "2", "3", "4", "5 o más", "No sé"] | None)
    @classmethod
    def normalizar_cantidad(cls, valor):
        return super().normalizar_cantidad(valor)


class TransferirCaso(BaseModel):
    id_municipio: int


class EliminarCasos(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=200)


class EliminarCasosResponse(BaseModel):
    eliminados: list[int]
    omitidos: list[int]


