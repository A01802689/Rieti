from sqlalchemy.orm import Session
from app.models.municipio import Municipio


def get_by_id(db:Session, id_municipioValorMePasan: int):  #primeor es el id de la clase que vien de la Bd
    """Busca un municipio por su identificador

    Args:
        db: sesión de base de datos
        id_municipioValorMePasan: identificador del municipio

    Returns:
        El municipio, o None si no existe
    """
    return db.query(Municipio).filter(Municipio.id_municipio == id_municipioValorMePasan).first()

#filtra por columna la clave, basicamente para detectar duplicados.
def get_by_clave(db: Session, clave: str):
    """Busca un municipio por su clave interna

    Args:
        db: sesión de base de datos
        clave: clave del municipio

    Returns:
        El municipio, o None si no existe
    """
    return db.query(Municipio).filter(Municipio.clave == clave).first()

#obtener todos los municipios.
def get_all(db: Session):
    """Lista todos los municipios ordenados por nombre

    Args:
        db: sesión de base de datos

    Returns:
        Los municipios
    """
    return db.query(Municipio).order_by(Municipio.nombre).all()