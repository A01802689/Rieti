from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class Seguimiento(Base):
    """Tabla seguimiento: nota de la línea de tiempo de un caso

    Attributes:
        consecutivo: número de la nota dentro de su caso, empieza en 1
        folio: identificador único con formato SEG-año-caso-consecutivo
        fecha: momento de la nota, con zona horaria
        tipo: clasificación de la nota, uno de los valores de TipoSeguimiento
    """
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
