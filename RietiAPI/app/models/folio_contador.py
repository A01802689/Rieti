from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Column
from app.db.base import Base

class FolioContador(Base):
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

    __table_args__ = (
        UniqueConstraint(
            "id_municipio",
            "anio",
            name="uq_folio_contador_munipio_anio"
        ),
    )
