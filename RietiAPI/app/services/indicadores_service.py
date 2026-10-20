from sqlalchemy.orm import Session

from app.repositories import indicadores_repository
from app.schemas.indicadores import IndicadoresLoginResponse


def obtener_indicadores_login(db: Session) -> IndicadoresLoginResponse:
    """Calcula los indicadores públicos que se muestran en la pantalla de inicio de sesión

    Args:
        db: sesión de base de datos

    Returns:
        Totales de reportes registrados, casos activos y niños atendidos
    """
    return IndicadoresLoginResponse(
        reportes_registrados=int(indicadores_repository.contar_reportes(db) or 0),
        casos_activos=int(indicadores_repository.contar_casos_activos(db) or 0),
        ninos_atendidos=int(indicadores_repository.sumar_ninos_atendidos(db) or 0),
    )
