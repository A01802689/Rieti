from sqlalchemy.orm import Session
from app.repositories import municipio_repository
#junto todo lo de, schemas, modelo y repositorio

#Services usa  todo lo que esta debajo
# el schema me confirma que tenga el formato que necesito (valida)
#el modelo, construyo el oibjeto de esta clase apenas (construye), represneta una fila excta de la tablad
# el repositorio (consulta o modfica la base de datos)
def get_municipios(db: Session):
    return municipio_repository.get_all(db)