from sqlalchemy import exists, func
from sqlalchemy.orm import Session, aliased

from app.models.caso import Caso
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.models.seguimiento import Seguimiento
from app.models.usuario import Usuario
from app.models.usuario_caso import UsuarioCaso

def get_by_id(db: Session, id_caso: int) -> Caso | None:
    return db.get(Caso, id_caso)


def obtener_para_actualizar(db: Session, id_caso: int) -> Caso | None:
    return db.query(Caso).filter(Caso.id_caso == id_caso).with_for_update().first()


def obtener_reporte_para_actualizar(db: Session, id_reporte: int) -> Reporte | None:
    return db.query(Reporte).filter(Reporte.id_reporte == id_reporte).with_for_update().first()


def obtener_id_municipio_ubicacion(db: Session, id_ubicacion: int) -> int | None:
    return db.query(Ubicacion.id_municipio).filter(Ubicacion.id_ubicacion == id_ubicacion).scalar()


def obtener_ubicacion(db: Session, id_ubicacion: int) -> Ubicacion | None:
    return db.get(Ubicacion, id_ubicacion)


def obtener_datos_ubicacion(db: Session, id_ubicacion: int):
    return (
        db.query(
            Ubicacion.colonia, Ubicacion.calle, Ubicacion.referencia,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .filter(Ubicacion.id_ubicacion == id_ubicacion)
        .first()
    )


def _consulta_datos(db: Session):
    municipio_ubicacion = aliased(Municipio)
    cantidad_reportes = (
        db.query(func.count(Reporte.id_reporte))
        .filter(Reporte.id_caso == Caso.id_caso)
        .correlate(Caso)
        .scalar_subquery()
    )
    return (
        db.query(
            Caso,
            Municipio.nombre.label("municipio"),
            municipio_ubicacion.nombre.label("municipio_ubicacion"),
            Ubicacion.colonia, Ubicacion.calle,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
            cantidad_reportes.label("cantidad_reportes"),
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


def listar_para_eliminar(db: Session, ids_caso: list[int]) -> list[Caso]:
    return (
        db.query(Caso)
        .filter(Caso.id_caso.in_(ids_caso))
        .order_by(Caso.id_caso)
        .with_for_update()
        .all()
    )


def listar_reportes_de_casos(db: Session, ids_caso: list[int]):
    return (
        db.query(Reporte.id_caso, Reporte.id_reporte)
        .filter(Reporte.id_caso.in_(ids_caso))
        .order_by(Reporte.id_reporte)
        .all()
    )


def contar_seguimientos_de_casos(db: Session, ids_caso: list[int]):
    return (
        db.query(Seguimiento.id_caso, func.count(Seguimiento.id_seguimiento))
        .filter(Seguimiento.id_caso.in_(ids_caso))
        .group_by(Seguimiento.id_caso)
        .all()
    )


def liberar_reportes(db: Session, ids_caso: list[int]) -> None:
    (
        db.query(Reporte)
        .filter(Reporte.id_caso.in_(ids_caso))
        .update(
            {Reporte.id_caso: None, Reporte.estatus_seguimiento: None},
            synchronize_session=False,
        )
    )


def eliminar_seguimientos(db: Session, ids_caso: list[int]) -> None:
    db.query(Seguimiento).filter(Seguimiento.id_caso.in_(ids_caso)).delete(synchronize_session=False)


def eliminar_usuarios_caso(db: Session, ids_caso: list[int]) -> None:
    db.query(UsuarioCaso).filter(UsuarioCaso.id_caso.in_(ids_caso)).delete(synchronize_session=False)


def eliminar_casos(db: Session, casos: list[Caso]) -> None:
    for caso in casos:
        db.delete(caso)
    db.flush()


def eliminar_ubicaciones_sin_uso(db: Session, ids_ubicacion: list[int]) -> None:
    (
        db.query(Ubicacion)
        .filter(
            Ubicacion.id_ubicacion.in_(ids_ubicacion),
            ~exists().where(Reporte.id_ubicacion == Ubicacion.id_ubicacion),
            ~exists().where(Caso.id_ubicacion == Ubicacion.id_ubicacion),
        )
        .delete(synchronize_session=False)
    )
