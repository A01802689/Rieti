from sqlalchemy import Column, Integer, String
from app.db.base import Base #Base que creamos en app/db/base.py


class Municipio(Base):
    __tablename__ = "municipio"
    id_municipio = Column(Integer, primary_key=True)
    nombre = Column(String(100))