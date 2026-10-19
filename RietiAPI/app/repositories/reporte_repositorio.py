from sqlalchemy import exists, func, or_
from sqlalchemy.orm import Session

from app.models.caso import Caso
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion


def listar(
    db: Session,
    *,
    id_usuario: int | None = None,
    id_caso: int | None = None,
):
    consulta = (
        db.query(
            Reporte.id_reporte,
            Reporte.id_usuario,
            Reporte.id_caso,
            Reporte.folio_reporte,
            Reporte.fecha_reporte,
            Reporte.descripcion,
            Reporte.estatus_seguimiento,
            Reporte.cantidad_nna,
            Reporte.edad_aproximada,
            Reporte.tipo_trabajo,
            Reporte.riesgo,
            Reporte.imagen_key,
            Municipio.nombre.label("municipio"),
            Ubicacion.colonia,
            Ubicacion.calle,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .join(Ubicacion, Reporte.id_ubicacion == Ubicacion.id_ubicacion)
        .join(Municipio, Ubicacion.id_municipio == Municipio.id_municipio)
    )
    if id_usuario is not None:
        consulta = consulta.filter(Reporte.id_usuario == id_usuario)
    if id_caso is not None:
        consulta = consulta.filter(Reporte.id_caso == id_caso)

    return (
        consulta.order_by(Reporte.fecha_reporte.desc(), Reporte.id_reporte.desc())
        .all()
    )


def obtener_detalle(db: Session, id_reporte: int):
    return (
        db.query(
            Reporte.id_reporte,
            Reporte.id_usuario,
            Reporte.id_caso,
            Reporte.folio_reporte,
            Reporte.fecha_reporte,
            Reporte.descripcion,
            Reporte.estatus_seguimiento,
            Reporte.cantidad_nna,
            Reporte.edad_aproximada,
            Reporte.tipo_trabajo,
            Reporte.riesgo,
            Reporte.imagen_key,
            Municipio.nombre.label("municipio"),
            Ubicacion.colonia,
            Ubicacion.calle,
            Ubicacion.referencia,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .join(Ubicacion, Reporte.id_ubicacion == Ubicacion.id_ubicacion)
        .join(Municipio, Ubicacion.id_municipio == Municipio.id_municipio)
        .filter(Reporte.id_reporte == id_reporte)
        .first()
    )


def obtener_para_actualizar(db: Session, id_reporte: int) -> Reporte | None:
    return (
        db.query(Reporte)
        .filter(Reporte.id_reporte == id_reporte)
        .with_for_update()
        .first()
    )


def obtener_para_eliminar(db: Session, ids: list[int]) -> list[Reporte]:
    return (
        db.query(Reporte)
        .filter(Reporte.id_reporte.in_(ids))
        .order_by(Reporte.id_reporte)
        .with_for_update()
        .all()
    )


def existe_caso(db: Session, id_caso: int) -> bool:
    return db.query(exists().where(Caso.id_caso == id_caso)).scalar()


def eliminar(db: Session, reporte: Reporte) -> None:
    db.delete(reporte)
    db.flush()


def ubicacion_en_uso(db: Session, id_ubicacion: int) -> bool:
    return db.query(
        or_(
            exists().where(Reporte.id_ubicacion == id_ubicacion),
            exists().where(Caso.id_ubicacion == id_ubicacion),
        )
    ).scalar()


def eliminar_ubicacion(db: Session, id_ubicacion: int) -> None:
    (
        db.query(Ubicacion)
        .filter(Ubicacion.id_ubicacion == id_ubicacion)
        .delete(synchronize_session=False)
    )


def obtener_imagen_key(db: Session, id_reporte: int):
    return (
        db.query(Reporte.imagen_key)
        .filter(Reporte.id_reporte == id_reporte)
        .first()
    )

