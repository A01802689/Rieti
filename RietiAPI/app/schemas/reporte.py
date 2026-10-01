from pydantic import BaseModel
from enum import Enum

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
    id_usuario: int | None = None
    id_ubicacion: int
    folio_reporte: str
    cantidad_nna: CantidadNna
    edad_aproximada: EdadAproximada
    tipo_trabajo: TipoTrabajo
    descripcion: str | None = None
    imagen: str


