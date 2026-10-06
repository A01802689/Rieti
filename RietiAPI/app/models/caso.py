from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy import Enum as SQLEnum
from enum import Enum

from app.db.base import Base

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
    fecha_caso = Column(
        DateTime,
        nullable = False,
        server_default = func.now()
    )
    notas = Column(
        Text,
        nullable = True, 
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