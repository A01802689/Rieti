from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from app.models.caso import Caso
from app.models.municipio import Municipio
from app.models.ubicacion import Ubicacion
from app.models.seguimiento import Seguimiento
from app.models.usuario import Usuario

def get_by_id(db: Session, id_caso: int) -> Caso | None:
    return db.get(Caso, id_caso)


def obtener_para_actualizar(db: Session, id_caso: int) -> Caso | None:
    return db.query(Caso).filter(Caso.id_caso == id_caso).with_for_update().first()


def _consulta_datos(db: Session):
    municipio_ubicacion = aliased(Municipio)
    return (
        db.query(
            Caso,
            Municipio.nombre.label("municipio"),
            municipio_ubicacion.nombre.label("municipio_ubicacion"),
            Ubicacion.colonia, Ubicacion.calle,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .join(Municipio, Municipio.id_municipio == Caso.id_municipio)
        .join(Ubicacion, Ubicacion.id_ubicacion == Caso.id_ubicacion)
        .join(municipio_ubicacion, municipio_ubicacion.id_municipio == Ubicacion.id_municipio)
    )


def listar(db: Session):
    return _consulta_datos(db).order_by(Caso.fecha_caso.desc(), Caso.id_caso.desc()).all()


def obtener_detalle(db: Session, id_caso: int):
    return _consulta_datos(db).filter(Caso.id_caso == id_caso).first()


def listar_seguimientos(db: Session, id_caso: int):
    return (
        db.query(Seguimiento, Usuario.nombre, Usuario.apellido)
        .join(Usuario, Usuario.id_usuario == Seguimiento.id_usuario_autor)
        .filter(Seguimiento.id_caso == id_caso)
        .order_by(Seguimiento.consecutivo.asc())
        .all()
    )
