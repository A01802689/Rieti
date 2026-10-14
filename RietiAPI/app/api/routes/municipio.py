from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.municipio import  MunicipioResponse
from app.services import municipio_service

router = APIRouter()



@router.get("/dashboard/municipios", response_model=list[MunicipioResponse])
def listar_municipios(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.rol is None:
        raise HTTPException(status_code=403, detail="Acceso solo para personal autorizado")
    return municipio_service.get_municipios(db)