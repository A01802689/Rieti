from sqlalchemy import Column, Integer, DateTime, ForeignKey, func
from sqlalchemy import Enum as SQLEnum
from enum import Enum

from app.db.base import Base
from app.models.reporte import CantidadNNA, EdadAproximada, TipoTrabajo

class Urgencia(str, Enum):
    BAJA = "Baja"
    MEDIA = "Media"
    ALTA = "Alta"

class Estado(str, Enum):
    ABIERTO = "Abierto"
    EN_DESARROLLO = "En desarrollo"
    CERRADO = "Cerrado"

class Caso(Base):
    __tablename__ = "caso"

    id_caso = Column(
        Integer,primary_key=True,index=True
)
    id_municipio = Column(
        Integer,
        ForeignKey("municipio.id_municipio"),
        nullable = False,
    )
    id_ubicacion = Column(
        Integer,
        ForeignKey("ubicacion.id_ubicacion"),
        nullable=False
    )
    estado = Column(
        SQLEnum(
            Estado,
            name = "estado",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable = True
    )
    cantidad_nna = Column(
        SQLEnum(CantidadNNA, name="cantidad_nna_reporte",
                values_callable=lambda items: [item.value for item in items]),
        nullable=False, default=CantidadNNA.NO_SE, server_default="No sé",
    )
    edad_aproximada = Column(
        SQLEnum(EdadAproximada, name="edad_aproximada_reporte",
                values_callable=lambda items: [item.value for item in items]),
        nullable=False, default=EdadAproximada.NO_SE, server_default="No sé",
    )
    tipo_trabajo = Column(
        SQLEnum(TipoTrabajo, name="tipo_trabajo_reporte",
                values_callable=lambda items: [item.value for item in items]),
        nullable=False, default=TipoTrabajo.NO_SE, server_default="No sé",
    )
    fecha_caso = Column(
        DateTime,
        nullable = False,
        server_default = func.now()
    )
    urgencia = Column(     
        SQLEnum(
            Urgencia,
            name="urgencia",
            values_callable=lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable=True
    )
