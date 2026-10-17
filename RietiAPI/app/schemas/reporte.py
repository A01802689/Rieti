from datetime import datetime

from pydantic import BaseModel, Field
from enum import Enum
from app.schemas.ubicacion import UbicacionCreate
from typing import Literal

from app.models.reporte import EstatusSeguimiento

class CantidadNna(str, Enum):
    UNO = "1"
    DOS = "2"
    TRES = "3"
    CUATRO = "4"
    CINCO_O_MAS = "5 o más"
    NO_SE = "No sé"

class EdadAproximada(str, Enum):
    CERO_A_CINCO = "0-5"
    SEIS_A_ONCE = "6-11"
    DOCE_A_CATORCE = "12-14"
    QUINCE_A_DIECISIETE = "15-17"
    NO_SE = "No sé"

class TipoTrabajo(str, Enum):
    VENTA_AMBULANTE = "Venta ambulante"
    LIMPIEZA_DE_PARABRISAS = "Limpieza de parabrisas"
    MENDICIDAD = "Mendicidad"
    CARGA_Y_DESCARGA = "Carga y descarga"
    TRABAJO_EN_COMERCIO = "Trabajo en comercio"
    CAMPO = "Campo"
    CONSTRUCCION = "Construcción"
    TRABAJO_DOMESTICO = "Trabajo doméstico"
    RECOLECCION_DE_RESIDUOS = "Recolección de residuos"
    OTRA_ACTIVIDAD = "Otra actividad"
    NO_SE = "No sé"

class ReporteCreate(BaseModel):
    ubicacion: UbicacionCreate
    cantidad_nna: CantidadNna
    edad_aproximada: EdadAproximada 
    tipo_trabajo: TipoTrabajo
    descripcion: str | None = None
    imagen_content_type: Literal["image/jpeg", "image/png"] | None = None
    con_seguimiento: bool


class ActualizarReporte(BaseModel):
    model_config = {"extra": "forbid"}

    estatus_seguimiento: EstatusSeguimiento | None = None


class AsociarReporteACaso(BaseModel):
    id_caso: int = Field(gt=0)

class ReporteCasoResponse(BaseModel):
    id_reporte: int
    id_caso: int


class UbicacionReporteListado(BaseModel):
    municipio: str
    colonia: str
    calle: str
    lat: float
    lng: float


class UbicacionReporteDetalle(UbicacionReporteListado):
    referencia: str | None


class ReporteListado(BaseModel):
    id_reporte: int
    id_caso: int | None
    folio_reporte: str
    fecha_reporte: datetime
    descripcion: str | None
    estatus_seguimiento: EstatusSeguimiento | None
    cantidad_nna: CantidadNna
    edad_aproximada: EdadAproximada
    tipo_trabajo: TipoTrabajo
    ubicacion: UbicacionReporteListado


class ReporteDetalle(ReporteListado):
    ubicacion: UbicacionReporteDetalle
    tiene_imagen: bool
    imagen: str | None = None
    url_descarga_imagen: str | None = None


class ImagenReporteResponse(BaseModel):
    url_visualizacion: str
    url_descarga: str
    expira_en: int

class ReporteResponse(BaseModel):
    id_reporte: int
    folio_reporte: str
    id_usuario: int | None
    id_caso: int | None
    id_ubicacion: int
    url_subida_imagen: str | None = None
    url_subida_expira_en: int | None = None
    
    model_config = {"from_attributes": True}


