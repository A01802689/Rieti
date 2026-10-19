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
    response.headers["Cache-Control"] = "public, max-age=60"
    return indicadores_service.obtener_indicadores_login(db)
