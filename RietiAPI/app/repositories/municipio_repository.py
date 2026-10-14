from sqlalchemy.orm import Session
from app.models.municipio import Municipio


def get_by_id(db:Session, id_municipioValorMePasan: int):  #primeor es el id de la clase que vien de la Bd
    return db.query(Municipio).filter(Municipio.id_municipio == id_municipioValorMePasan).first()

#filtra por columna la clave, basicamente para detectar duplicados.
def get_by_clave(db: Session, clave: str):
    return db.query(Municipio).filter(Municipio.clave == clave).first()

#obtener todos los municipios.
def get_all(db: Session):
    return db.query(Municipio).order_by(Municipio.nombre).all()