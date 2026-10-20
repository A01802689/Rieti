from sqlalchemy import Integer, ForeignKey, UniqueConstraint, Column
from app.db.base import Base

class FolioContador(Base):
    """Tabla folio_contador: último consecutivo de folio entregado por municipio y año

    Attributes:
        ultimo_consecutivo: último número usado en los folios RIETI-clave-año-consecutivo
    """
    __tablename__ = "folio_contador"

    id_folio_contador = Column(
        Integer,
        primary_key=True
    )
    id_municipio = Column(
        Integer,
        ForeignKey("municipio.id_municipio"),
        nullable=False
    )

    anio = Column(
        Integer,
        nullable=False
    )

    ultimo_consecutivo = Column (
        Integer,
        nullable = False,
        default=0
    )

    __table_args__ = (
        UniqueConstraint(
            "id_municipio",
            "anio",
            name="uq_folio_contador_municipio_anio"
        ),
    )
