from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.municipio import  MunicipioResponse
from app.services import municipio_service

# PODRIAa agrefar una expepcion en caso de que no quieran que se repitabn los municipio.


router = APIRouter(prefix="/municipios", tags=["Municipios"])

@router.get("", response_model=list[MunicipioResponse])
@router.get("/", response_model=list[MunicipioResponse], include_in_schema=False)
def listar_municipios(db: Session = Depends(get_db)):
    return municipio_service.get_municipios(db)