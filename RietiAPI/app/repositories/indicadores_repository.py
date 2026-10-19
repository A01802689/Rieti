from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.caso import Caso, Estado
from app.models.reporte import CantidadNNA, Reporte

NINOS_POR_CANTIDAD = case(
    (Caso.cantidad_nna == CantidadNNA.UNO, 1),
    (Caso.cantidad_nna == CantidadNNA.DOS, 2),
    (Caso.cantidad_nna == CantidadNNA.TRES, 3),
    (Caso.cantidad_nna == CantidadNNA.CUATRO, 4),
    (Caso.cantidad_nna == CantidadNNA.CINCO_O_MAS, 5),
    else_=0,
)


def contar_reportes(db: Session) -> int:
    return db.query(func.count(Reporte.id_reporte)).scalar()


def contar_casos_activos(db: Session) -> int:
    return (
        db.query(func.count(Caso.id_caso))
        .filter(Caso.estado.in_([Estado.ABIERTO, Estado.EN_DESARROLLO]))
        .scalar()
    )


def sumar_ninos_atendidos(db: Session) -> int:
    return (
        db.query(func.coalesce(func.sum(NINOS_POR_CANTIDAD), 0))
        .filter(Caso.estado.in_([Estado.EN_DESARROLLO, Estado.CERRADO]))
        .scalar()
    )
