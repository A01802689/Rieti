from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class Seguimiento(Base):
    __tablename__ = "seguimiento"

    id_seguimiento = Column(Integer, primary_key=True)
    id_caso = Column(Integer, ForeignKey("caso.id_caso"), nullable=False)
    id_usuario_autor = Column(
        Integer, ForeignKey("usuario.id_usuario"), nullable=False
    )
    consecutivo = Column(Integer, nullable=False)
    folio = Column(String(80), nullable=False, unique=True)
    fecha = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    tipo = Column(String(32), nullable=False)
    nota = Column(Text, nullable=False)
