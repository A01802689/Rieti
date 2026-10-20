from sqlalchemy import Column, DateTime, ForeignKey, Identity, Integer, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
from enum import Enum


class EntityType(str, Enum):
    """Tipo de entidad a la que se refiere una entrada de la bitácora"""
    USUARIO = "usuario"
    MUNICIPIO = "municipio"
    REPORTE = "reporte"
    UBICACION = "ubicacion"
    CASO = "caso"


class Log(Base):
    """Tabla logs: bitácora de acciones de las personas usuarias del panel

    Attributes:
        action: descripción de la acción realizada
        entity_type: tipo de registro afectado
        id_registro_afectado: identificador del registro afectado dentro de su tabla
        before_data: valores anteriores a la acción, objeto vacío si no había
        after_data: valores posteriores a la acción, NULL si la acción no deja valores nuevos como en una baja
        fecha: momento de la acción en UTC sin zona horaria
    """
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
