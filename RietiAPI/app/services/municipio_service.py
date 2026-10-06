from app.repositories import municipio_repository
from app.models.municipio import Municipio
from app.schemas.municipio import MunicipioCreate
from sqlalchemy.orm import Session
#junto todo lo de, schemas, modelo y repositorio

#Services usa  todo lo que esta debajo
# el schema me confirma que tenga el formato que necesito (valida)
#el modelo, construyo el oibjeto de esta clase apenas (construye), represneta una fila excta de la tablad
# el repositorio (consulta o modfica la base de datos)
def create_Municipio(db:Session, info: MunicipioCreate):
    nuevo_municipio = Municipio(
        nombre = info.nombre,
        clave = info.clave
    )
    return municipio_repository.create_municipio(db, nuevo_municipio)
