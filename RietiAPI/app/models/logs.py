from sqlalchemy import Column, DateTime, ForeignKey, Identity, Integer, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
from enum import Enum


class EntityType(str, Enum):
    USUARIO = "usuario"
    MUNICIPIO = "municipio"
    REPORTE = "reporte"
    UBICACION = "ubicacion"
    CASO = "caso"


class Log(Base):
    __tablename__ = "logs"

    id_logs = Column(
        Integer,
        Identity(always=True),
        primary_key=True,
        index=True
    )
    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )
    action = Column(
        Text,
        nullable=False
    )
    entity_type = Column(
        SQLEnum(
            EntityType,
            name = "entity_type_logs",
            values_callable = lambda enum_class: [
                item.value for item in enum_class
            ]
        ),
        nullable=False
    )
    id_registro_afectado = Column(
        Integer,
        nullable=False
    )
    before_data = Column(
        JSONB,
        nullable=False
    )
    after_data = Column(
        JSONB(none_as_null=True),
        nullable=True
    )
    fecha = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )
