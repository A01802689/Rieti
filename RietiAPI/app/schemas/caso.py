from datetime import datetime
from app.schemas.fechas import FechaUTC
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator
from app.models.caso import Estado, Urgencia
from app.models.reporte import CantidadNNA, EdadAproximada, EstatusSeguimiento, TipoTrabajo
from app.schemas.seguimiento import SeguimientoResponse


class ContratoCantidadCaso(BaseModel):
    """Base de los esquemas con cantidad_nna que acepta y devuelve números para 1 a 4

    El dashboard maneja 1, 2, 3 y 4 como números y 5 o más y No sé como texto, mientras la base guarda siempre texto
    """
    @field_validator("cantidad_nna", mode="before", check_fields=False,
                     json_schema_input_type=Literal[1, 2, 3, 4, "1", "2", "3", "4", "5 o más", "No sé"])
    @classmethod
    def normalizar_cantidad(cls, valor):
        """Convierte a texto la cantidad cuando llega como entero

        Args:
            valor: valor recibido

        Returns:
            El valor como texto si era entero, o el mismo valor en otro caso
        """
        return str(valor) if type(valor) is int else valor

    @field_serializer("cantidad_nna", check_fields=False, when_used="unless-none")
    def serializar_cantidad(self, valor) -> Literal[1, 2, 3, 4, "5 o más", "No sé"]:
        """Serializa la cantidad como número de 1 a 4 y como texto en los demás casos

        Args:
            valor: cantidad de niños como enum

        Returns:
            El número para 1 a 4, o el texto 5 o más y No sé
        """
        return int(valor.value) if valor.value in ("1", "2", "3", "4") else valor.value


class DatosCaso(ContratoCantidadCaso):
    """Datos confirmados de un caso, independientes de los de sus reportes"""
    cantidad_nna: CantidadNNA
    edad_aproximada: EdadAproximada
    tipo_trabajo: TipoTrabajo


class CasoCreate(ContratoCantidadCaso):
    """Datos para crear un caso directamente, con los datos confirmados en No sé por omisión"""
    id_municipio: int
    id_ubicacion: int
    estado: Estado | None = None
    urgencia: Urgencia | None = None
    cantidad_nna: CantidadNNA = CantidadNNA.NO_SE
    edad_aproximada: EdadAproximada = EdadAproximada.NO_SE
    tipo_trabajo: TipoTrabajo = TipoTrabajo.NO_SE


class UbicacionCasoCreate(BaseModel):
    """Ubicación propia que se captura al abrir un caso

    Attributes:
        longitud: grados, entre -180 y 180
        latitud: grados, entre -90 y 90
    """
    colonia: str = Field(min_length=1, max_length=100)
    calle: str = Field(min_length=1, max_length=100)
    longitud: float = Field(ge=-180, le=180)
    latitud: float = Field(ge=-90, le=90)
    referencia: str | None = None


class AbrirCasoDesdeReporte(BaseModel):
    """Solicitud opcional para abrir un caso desde un reporte

    Attributes:
        id_municipio: si se omite se usa el municipio del reporte
        ubicacion: si se omite el caso nace sin colonia, calle ni coordenadas
    """
    id_municipio: int | None = None
    ubicacion: UbicacionCasoCreate | None = None
    urgencia: Urgencia | None = None


class CasoAbiertoResponse(DatosCaso):
    """Respuesta al abrir un caso desde un reporte"""
    id_caso: int
    id_reporte: int
    id_municipio: int
    id_ubicacion: int
    estado: Estado
    urgencia: Urgencia | None
    estatus_seguimiento: EstatusSeguimiento


class MunicipioCasoResponse(BaseModel):
    """Municipio responsable de un caso"""
    nombre: str


class UbicacionCasoResponse(BaseModel):
    """Ubicación de un caso en las respuestas

    Attributes:
        colonia: None si el caso se abrió solo con municipio
        calle: None si el caso se abrió solo con municipio
        lat: latitud en grados, None si no hay coordenadas
        lng: longitud en grados, None si no hay coordenadas
    """
    municipio: str
    colonia: str | None
    calle: str | None
    lat: float | None
    lng: float | None


class CasoListado(DatosCaso):
    """Caso tal como aparece en el listado, sin notas ni seguimientos

    Attributes:
        estado: None en filas antiguas sin estado
        fecha_caso: fecha de apertura en UTC sin zona horaria
        urgencia: None mientras no se asigne
        cantidad_reportes: número de reportes vinculados al caso
    """
    id_caso: int
    municipio: MunicipioCasoResponse
    ubicacion: UbicacionCasoResponse
    estado: Estado | None
    fecha_caso: FechaUTC
    urgencia: Urgencia | None
    cantidad_reportes: int


class CasoDetalle(CasoListado):
    """Caso con su línea de tiempo

    Attributes:
        notas: texto del último seguimiento, None si no hay
        seguimientos: notas ordenadas por consecutivo
    """
    notas: str | None
    seguimientos: list[SeguimientoResponse]


class ActualizarUbicacionCaso(BaseModel):
    """Cambios parciales a la ubicación de un caso

    Los campos omitidos o None no se modifican y los campos desconocidos se rechazan

    Attributes:
        lat: latitud en grados, debe enviarse junto con lng
        lng: longitud en grados, debe enviarse junto con lat
    """
    model_config = ConfigDict(extra="forbid")
    colonia: str | None = Field(default=None, min_length=1, max_length=100)
    calle: str | None = Field(default=None, min_length=1, max_length=100)
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    referencia: str | None = None

    @model_validator(mode="after")
    def validar_coordenadas(self):
        """Exige que latitud y longitud se envíen juntas o ninguna

        Returns:
            El mismo objeto validado

        Raises:
            ValueError: si solo se envía una de las dos coordenadas
        """
        if (self.lat is None) != (self.lng is None):
            raise ValueError("lat y lng deben enviarse juntos")
        return self


class ActualizarCaso(ContratoCantidadCaso):
    """Cambios parciales a un caso

    Los campos omitidos o None no se modifican y los campos desconocidos se rechazan
    """
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
        """Convierte a texto la cantidad cuando llega como entero

        Args:
            valor: valor recibido

        Returns:
            El valor como texto si era entero, o el mismo valor en otro caso
        """
        return super().normalizar_cantidad(valor)


class TransferirCaso(BaseModel):
    """Municipio destino de una transferencia de caso"""
    id_municipio: int


class EliminarCasos(BaseModel):
    """Casos a eliminar en lote

    Attributes:
        ids: de 1 a 200 identificadores
    """
    ids: list[int] = Field(min_length=1, max_length=200)


class EliminarCasosResponse(BaseModel):
    """Resultado de eliminar casos en lote

    Attributes:
        eliminados: identificadores eliminados
        omitidos: identificadores que no existen o no estaban cerrados
    """
    eliminados: list[int]
    omitidos: list[int]


