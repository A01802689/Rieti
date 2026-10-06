from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.municipio import MunicipioCreate, MunicipioResponse
from app.services import municipio_service
from fastapi import APIRouter, Depends

# PODRIAa agrefar una expepcion en caso de que no quieran que se repitabn los municipio

router = APIRouter()
@router.post("/municipio", response_model= MunicipioResponse)

def crear_municipio(datos: MunicipioCreate, db: Session = Depends(get_db)):
     return municipio_service.create_Municipio(db, datos)