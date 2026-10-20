
from sqlalchemy import Column, DateTime, Integer, Text, Enum, ForeignKey, String, func
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
from enum import Enum

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


class EdadAproximada(str, Enum):
    """Rango de edad aproximada del menor, en años"""
    CERO_A_CINCO = "0-5"
    SEIS_A_ONCE = "6-11"
    DOCE_A_CATORCE = "12-14"
    QUINCE_A_DIECISIETE = "15-17"
    NO_SE = "No sé"

class EstatusSeguimiento(str, Enum):
    """Etapa de atención de un reporte"""
    RECIBIDO = "Recibido"
    EN_REVISION = "En revisión"
    CANALIZADO = "Canalizado"
    EN_ATENCION = "En atención"
    CONCLUIDO = "Concluido"
    RECHAZADO = "Rechazado"

class RiesgoReporte(str, Enum):
    """Nivel de riesgo que el personal asigna a un reporte"""
    BAJO = "Bajo"
    MEDIO = "Medio"
    ALTO = "Alto"

class CantidadNNA(str, Enum):
    """Cantidad de niños, niñas y adolescentes observados"""
    UNO = "1"
    DOS = "2"
    TRES = "3"
    CUATRO = "4"
    CINCO_O_MAS = "5 o más"
    NO_SE = "No sé"

class Reporte(Base):
    """Tabla reporte: aviso ciudadano de una posible situación de trabajo infantil

    Attributes:
        id_usuario: quien reportó, NULL si no pidió seguimiento
        id_caso: caso al que pertenece, NULL mientras no se canalice
        folio_reporte: folio único con formato RIETI-clave-año-consecutivo
        estatus_seguimiento: etapa de atención, NULL cuando el caso al que pertenecía se eliminó
        fecha_reporte: fecha de registro en UTC sin zona horaria
        imagen_key: clave del objeto en S3, NULL si no tiene imagen
        riesgo: NULL mientras el personal no lo asigne
    """
    __tablename__ = "reporte"

    id_reporte = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=True)
    id_caso = Column(Integer, ForeignKey("caso.id_caso"), nullable=True)
    id_ubicacion = Column(Integer, ForeignKey("ubicacion.id_ubicacion"), nullable=False)
    folio_reporte = Column(String(60), nullable=False, unique=True, index=True)
    estatus_seguimiento = Column(
        SQLEnum(
            EstatusSeguimiento,
            name = "estatus_seguimiento",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ],
        ),
        nullable = True,
        default=EstatusSeguimiento.RECIBIDO
    )
    cantidad_nna = Column(
        SQLEnum(
            CantidadNNA,
            name = "cantidad_nna",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable = False
    )
    edad_aproximada = Column(
        SQLEnum(
            EdadAproximada,
            name = "edad_aproximada",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable = False
    )
    tipo_trabajo = Column(
        SQLEnum(
            TipoTrabajo,
            name = "tipo_trabajo",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable = False
    )
    descripcion = Column(
        Text,
        nullable= True
    )
    fecha_reporte = Column(
        DateTime,
        nullable = False,
        server_default = func.now()
    )
    imagen_key = Column(
        String(255),
        nullable=True,
    )
    riesgo = Column(
        SQLEnum(
            RiesgoReporte,
            name = "riesgo_reporte",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable = True
    )
