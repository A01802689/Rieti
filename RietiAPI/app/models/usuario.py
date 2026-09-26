from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from app.db.base import Base

class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True)
    id_municipio = Column(Integer, ForeignKey("municipio.id_municipio"), nullable=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    correo = Column(String(30), nullable=False)
    contrasena_hash = Column(String(100), nullable=False)
    rol = Column(Enum("Alimentador", "Administrador", name="rol_usuario"), nullable=True)