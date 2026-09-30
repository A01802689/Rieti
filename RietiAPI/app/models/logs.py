from sqlalchemy import Column, Integer, Text, DateTime, func
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
from enum import Enum


class Entity_type(str, Enum):
    USUARIO = "usuario"
    MUNICIPIO = "municipio"
    REPORTE = "reporte"
    UBICACION = "ubicacion"
    CASO = "caso"


class logs(Base):
    __tablename__ = "base"

    id_logs = Column(
        Integer,
        primary_key=True,
        index=True
    )
    id_usuario = Column(
        Integer,
        nullable=False
    )
    action = Column(
        Text,
        nullable=False
    )
    entity_type = Column(
        SQLEnum(
            Entity_type,
            name = "entity_type",
            values_callale = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable=False
    )
    id_registro_afectado = Column(
        Integer,
        
    )

