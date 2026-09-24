
from sqlalchemy import Column, DateTime, Integer, Text, Enum, ForeignKey, String, func
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
from enum import Enum

class Riesgo(str, Enum):
    BAJO = "Bajo"
    MEDIO = "Medio"
    ALTO = "Alto"

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


class EdadAproximada(str, Enum):
    CERO_A_CINCO = "0-5"
    SEIS_A_ONCE = "6-11"
    DOCE_A_CATORCE = "12-14"
    NO_SE = "No sé"

class EstatusSeguimiento(str, Enum):
    RECIBIDO = "Recibido"
    EN_REVISION = "En revisión"
    CANALIZADO = "Canalizado"
    EN_ATENCION = "En atención"
    CONCLUIDO = "Concluido"

class CantidadNNA(str, Enum):
    UNO = "1"
    DOS = "2"
    TRES = "3"
    CUATRO = "4"
    CINCO_O_MAS = "5 o más"
    NO_SE = "No sé"

class Reporte(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=True)
    id_caso = Column(Integer, ForeignKey("caso.id"), nullable=True)
    id_ubicacion = Column(Integer, ForeignKey("ubicacion.id"), nullable=False)
    folio_reporte = Column(String(25), nullable=False)
    estatus_seguimiento = Column(
        SQLEnum(
            EstatusSeguimiento,
            name = "estatus_seguimiento",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ],
        ),
        nullable = False,
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
        nullable = True
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
    riesgo = Column (
        SQLEnum(
            Riesgo,
            name = "riesgo",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        default = Riesgo.BAJO,
        nullable = False
    )