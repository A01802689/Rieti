from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion

def create(db: Session, reporte: Reporte):
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte


def listar(
    db: Session,
    *,
    solo_sin_caso: bool,
    limit: int,
    offset: int,
):
    consulta = (
        db.query(
            Reporte.id_reporte,
            Reporte.id_caso,
            Reporte.folio_reporte,
            Reporte.fecha_reporte,
            Reporte.descripcion,
            Reporte.estatus_seguimiento,
            Reporte.cantidad_nna,
            Reporte.edad_aproximada,
            Reporte.tipo_trabajo,
            Municipio.nombre.label("municipio"),
            Ubicacion.colonia,
            Ubicacion.calle,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .join(Ubicacion, Reporte.id_ubicacion == Ubicacion.id_ubicacion)
        .join(Municipio, Ubicacion.id_municipio == Municipio.id_municipio)
    )
    if solo_sin_caso:
        consulta = consulta.filter(Reporte.id_caso.is_(None))

    return (
        consulta.order_by(Reporte.fecha_reporte.desc(), Reporte.id_reporte.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def obtener_detalle(db: Session, id_reporte: int):
    return (
        db.query(
            Reporte.id_reporte,
            Reporte.id_caso,
            Reporte.folio_reporte,
            Reporte.fecha_reporte,
            Reporte.descripcion,
            Reporte.estatus_seguimiento,
            Reporte.cantidad_nna,
            Reporte.edad_aproximada,
            Reporte.tipo_trabajo,
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


def obtener_imagen_key(db: Session, id_reporte: int):
    return (
        db.query(Reporte.imagen_key)
        .filter(Reporte.id_reporte == id_reporte)
        .first()
    )
    
