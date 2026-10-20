from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.caso import Caso, Estado
from app.models.reporte import CantidadNNA, Reporte

#: Cantidad de niños de un caso: 5 representa 5 o más y desconocido cuenta 0
NINOS_POR_CANTIDAD = case(
    (Caso.cantidad_nna == CantidadNNA.UNO, 1),
    (Caso.cantidad_nna == CantidadNNA.DOS, 2),
    (Caso.cantidad_nna == CantidadNNA.TRES, 3),
    (Caso.cantidad_nna == CantidadNNA.CUATRO, 4),
    (Caso.cantidad_nna == CantidadNNA.CINCO_O_MAS, 5),
    else_=0,
)


def contar_reportes(db: Session) -> int:
    """Cuenta todos los reportes registrados

    Args:
        db: sesión de base de datos

    Returns:
        Total de reportes
    """
    return db.query(func.count(Reporte.id_reporte)).scalar()


def contar_casos_activos(db: Session) -> int:
    """Cuenta los casos Abiertos o En desarrollo

    Args:
        db: sesión de base de datos

    Returns:
        Total de casos activos
    """
    return (
        db.query(func.count(Caso.id_caso))
        .filter(Caso.estado.in_([Estado.ABIERTO, Estado.EN_DESARROLLO]))
        .scalar()
    )


def sumar_ninos_atendidos(db: Session) -> int:
    """Suma los niños de los casos En desarrollo o Cerrados

    Cuenta 5 por cada caso con 5 o más niños y 0 cuando la cantidad es desconocida

    Args:
        db: sesión de base de datos

    Returns:
        Total de niños atendidos
    """
    return (
        db.query(func.coalesce(func.sum(NINOS_POR_CANTIDAD), 0))
        .filter(Caso.estado.in_([Estado.EN_DESARROLLO, Estado.CERRADO]))
        .scalar()
    )
