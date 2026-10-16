from sqlalchemy.orm import Session, joinedload
from app.models.usuario import Usuario #importo el molde
from sqlalchemy import func


def get_by_id(db: Session, id_usuario: int):
    return db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
#quiero ahcer una consulta sobre la tabla Usuario
#dame las filas sonde las columas dle id_usario sea igual al valor que me dieron en el parametro
# regresa el primer resulado que coincida 

def get_by_email(db: Session, email: str):
    return db.query(Usuario).filter(func.lower(Usuario.correo) == email.lower()).first()

#ya usuario ya como objeto de la clase Usuario
def create(db: Session, usuario: Usuario):
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

def update(db: Session, usuario: Usuario):
    db.commit()
    db.refresh(usuario)
    return usuario


#dependiendo del borrar usarios los admin 
def delete(db: Session, id_usuario: int):
    filas_borradas = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).delete()
    db.commit()
    return filas_borradas


def get_all(db: Session):
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.municipio))
        .order_by(Usuario.apellido, Usuario.nombre)
        .all()
    )