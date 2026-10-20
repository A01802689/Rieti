from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.limiter import limiter
from app.schemas.indicadores import IndicadoresLoginResponse
from app.services import indicadores_service

router = APIRouter(prefix="/indicadores", tags=["Indicadores"])


@router.get("/login", response_model=IndicadoresLoginResponse)
@limiter.limit("30/minute")
def indicadores_login(request: Request, response: Response, db: Session = Depends(get_db)):
    """Obtiene los indicadores generales de la pantalla de inicio de sesión, es público y no requiere sesión

    La respuesta se puede cachear 60 segundos y se limita a 30 peticiones por minuto

    Args:
        request: petición HTTP, la necesita el limitador de peticiones
        response: respuesta HTTP a la que se agrega Cache-Control
        db: sesión de base de datos

    Returns:
        Reportes registrados, casos activos y niños atendidos

    Raises:
        HTTPException: 429 si se supera el límite de peticiones
    """
    response.headers["Cache-Control"] = "public, max-age=60"
    return indicadores_service.obtener_indicadores_login(db)
