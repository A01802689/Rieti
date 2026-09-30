from sqlalchemy.orm import Session
from app.models.municipio import Municipio


def get_by_id(db:Session, id_municipioValorMePasan: int):  #primeor es el id de la clase que vien de la Bd
    return db.query(Municipio).filter(Municipio.id_municipio == id_municipioValorMePasan).first()

def create_municipio(db: Session, objetodeClaseMunicipio:Municipio):
    db.add(objetodeClaseMunicipio)
    db.commit()
    db.refresh(objetodeClaseMunicipio)
    return objetodeClaseMunicipio