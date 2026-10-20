from datetime import datetime
from app.schemas.fechas import FechaUTC

from pydantic import BaseModel, Field
from enum import Enum
from app.schemas.ubicacion import UbicacionCreate
from typing import Literal

from app.models.reporte import EstatusSeguimiento, RiesgoReporte

class CantidadNna(str, Enum):
    """Cantidad de niños, niñas y adolescentes en el reporte"""
    UNO = "1"
    DOS = "2"
    TRES = "3"
    CUATRO = "4"
    CINCO_O_MAS = "5 o más"
    NO_SE = "No sé"

class EdadAproximada(str, Enum):
    """Rango de edad aproximada del menor, en años"""
    CERO_A_CINCO = "0-5"
    SEIS_A_ONCE = "6-11"
    DOCE_A_CATORCE = "12-14"
    QUINCE_A_DIECISIETE = "15-17"
    NO_SE = "No sé"

class TipoTrabajo(str, Enum):
    """Actividad que realiza el menor según el reporte"""
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

class ProyeccionReporte(str, Enum):
    """Nivel de detalle con el que se entrega un listado de reportes

    Attributes:
        COMPLETA: todos los campos
        REDUCIDA: sin descripción, usuario ni imagen, para quien solo ve mapa o estadísticas
        CIUDADANO: la vista de una persona ciudadana sobre sus propios reportes
    """
    COMPLETA = "completa"
    REDUCIDA = "reducida"
    CIUDADANO = "ciudadano"

class ReporteCreate(BaseModel):
    """Datos con los que una persona ciudadana crea un reporte

    Attributes:
        imagen_content_type: si se envía, la respuesta incluye una URL para subir la imagen
        con_seguimiento: si es True el reporte queda ligado a la cuenta de quien reporta
    """
    ubicacion: UbicacionCreate
    cantidad_nna: CantidadNna
    edad_aproximada: EdadAproximada 
    tipo_trabajo: TipoTrabajo
    descripcion: str | None = None
    imagen_content_type: Literal["image/jpeg", "image/png"] | None = None
    con_seguimiento: bool
    riesgo: RiesgoReporte | None = None


class ActualizarReporte(BaseModel):
    """Cambios parciales a un reporte, los campos omitidos o None no se modifican"""
    model_config = {"extra": "forbid"}

    estatus_seguimiento: EstatusSeguimiento | None = None


class CambiarEstatusReporte(BaseModel):
    """Estatus de seguimiento nuevo de un reporte"""
    model_config = {"extra": "forbid"}

    estatus_seguimiento: EstatusSeguimiento


class EstatusReporteResponse(BaseModel):
    """Estatus de seguimiento actual de un reporte"""
    id_reporte: int
    estatus_seguimiento: EstatusSeguimiento


class AsociarReporteACaso(BaseModel):
    """Caso al que se asocia un reporte"""
    id_caso: int = Field(gt=0)

class ReporteCasoResponse(BaseModel):
    """Reporte con el caso al que quedó asociado"""
    id_reporte: int
    id_caso: int
    estatus_seguimiento: EstatusSeguimiento


class ReporteEstatusCasoResponse(BaseModel):
    """Reporte con su caso y estatus tras una acción de triaje

    Attributes:
        id_caso: None si el reporte no pertenece a un caso
    """
    id_reporte: int
    id_caso: int | None
    estatus_seguimiento: EstatusSeguimiento


class EliminarReportes(BaseModel):
    """Reportes a eliminar en lote

    Attributes:
        ids: de 1 a 200 identificadores
    """
    ids: list[int] = Field(min_length=1, max_length=200)


class EliminarReportesResponse(BaseModel):
    """Resultado de eliminar reportes en lote

    Attributes:
        eliminados: identificadores eliminados
        omitidos: identificadores que no existen o no estaban rechazados
    """
    eliminados: list[int]
    omitidos: list[int]


class UbicacionReporteListado(BaseModel):
    """Ubicación de un reporte en el listado

    Attributes:
        lat: latitud en grados
        lng: longitud en grados
    """
    municipio: str
    colonia: str
    calle: str
    lat: float
    lng: float
    riesgo: RiesgoReporte | None = None


class UbicacionReporteDetalle(UbicacionReporteListado):
    """Ubicación de un reporte en su detalle, con referencia"""
    referencia: str | None


class ReporteListado(BaseModel):
    """Reporte tal como aparece en el listado

    Attributes:
        id_usuario: None si no pidió seguimiento o en la proyección reducida
        id_caso: None si no pertenece a un caso
        fecha_reporte: fecha de registro en UTC sin zona horaria
        descripcion: None si no se capturó o en la proyección reducida
        estatus_seguimiento: None si el caso al que pertenecía se eliminó
        riesgo: None mientras el personal no lo asigne
        imagen: URL de visualización, None si no tiene imagen o en la proyección reducida
    """
    id_reporte: int
    id_usuario: int | None
    id_caso: int | None
    folio_reporte: str
    fecha_reporte: FechaUTC
    descripcion: str | None
    estatus_seguimiento: EstatusSeguimiento | None
    cantidad_nna: CantidadNna
    edad_aproximada: EdadAproximada
    tipo_trabajo: TipoTrabajo
    riesgo: RiesgoReporte | None
    imagen: str | None = None
    ubicacion: UbicacionReporteListado


class ReporteDetalle(ReporteListado):
    """Reporte con todos sus datos

    Attributes:
        tiene_imagen: si el reporte tiene imagen registrada
        url_descarga_imagen: URL de descarga, None si no tiene imagen
    """
    ubicacion: UbicacionReporteDetalle
    tiene_imagen: bool
    url_descarga_imagen: str | None = None


class ImagenReporteResponse(BaseModel):
    """URL temporales de la imagen de un reporte

    Attributes:
        url_visualizacion: URL prefirmada para ver la imagen
        url_descarga: URL prefirmada para descargarla
        expira_en: segundos de vigencia de ambas URL
    """
    url_visualizacion: str
    url_descarga: str
    expira_en: int

class ReporteResponse(BaseModel):
    """Respuesta al crear un reporte

    Attributes:
        id_usuario: None si no pidió seguimiento
        url_subida_imagen: URL prefirmada de subida, solo si se pidió imagen
        url_subida_expira_en: segundos de vigencia de la URL de subida
    """
    id_reporte: int
    folio_reporte: str
    id_usuario: int | None
    id_caso: int | None
    id_ubicacion: int
    url_subida_imagen: str | None = None
    url_subida_expira_en: int | None = None
    
    model_config = {"from_attributes": True}


