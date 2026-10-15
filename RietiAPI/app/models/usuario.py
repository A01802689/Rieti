from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base

class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True)
    id_municipio = Column(Integer, ForeignKey("municipio.id_municipio"), nullable=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    correo = Column(String(100), nullable=False)
    contrasena_hash = Column(String(100), nullable=False)
    rol = Column(Enum("Alimentador", "Administrador", name="rol_usuario"), nullable=True)
    ultimo_acceso = Column(DateTime, nullable=True)
    permisos = Column(ARRAY(Text), nullable=False, server_default="{}")

    municipio = relationship("Municipio")