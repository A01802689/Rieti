from sqlalchemy import Column, Integer, ForeignKey
from app.db.base import Base

class UsuarioCaso(Base):
    __tablename__ = "usuario_caso"
    id_usuario_caso = Column(Integer, primary_key=True)
    id_usuario= Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_caso = Column(Integer, ForeignKey("caso.id_caso"), nullable=False)
    