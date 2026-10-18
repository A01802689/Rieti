from sqlalchemy import Column, Text, Integer, String, ForeignKey
from geoalchemy2 import Geometry

from app.db.base import Base

class Ubicacion(Base):
    __tablename__ = "ubicacion"

    id_ubicacion = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    id_municipio = Column(
        Integer,
        ForeignKey("municipio.id_municipio"),
        nullable=False
    )
    colonia = Column(
        String(100),
        nullable=True
    )
    calle = Column(
        String(100),
        nullable=True
    )
    coordenadas = Column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=True
    )
    referencia = Column(
        Text,
        nullable = True
    )