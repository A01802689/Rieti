from fastapi import HTTPException
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo
from app.repositories import folio_contador_repository

from app.models.municipio import Municipio
from app.models.ubicacion import Ubicacion
from app.models.reporte import Reporte
from app.schemas.reporte import ReporteCreate

def create_reporte(db: Session, datos: ReporteCreate):

    municipio = (
        db.query(Municipio)
        .filter(Municipio.nombre == datos.ubicacion.municipio)
        .first()
    )

    if municipio is None:
        raise HTTPException(
            status_code=404,
            detail="El municipio no existe"
        )
    
    try:
        anio = datetime.now(ZoneInfo("America/Mexico_City")).year

        consecutivo = folio_contador_repository.obtener_siguiente_consecutivo(
            db=db,
            id_municipio=municipio.id_municipio,
            anio=anio,
        )
        folio_reporte = f"RIETI-{municipio.clave}-{anio}-{consecutivo:06d}"

        nueva_ubicacion = Ubicacion(
            id_municipio=municipio.id_municipio,
            colonia=datos.ubicacion.colonia,
            calle=datos.ubicacion.calle,
            coordenadas=WKTElement(
                f"POINT({datos.ubicacion.longitud} {datos.ubicacion.latitud})",
                srid=4326,
            ),
            referencia=datos.ubicacion.referencia,
        )

        db.add(nueva_ubicacion)
        db.flush()

        nuevo_reporte = Reporte(
            id_usuario=datos.id_usuario,
            id_ubicacion=nueva_ubicacion.id_ubicacion,
            folio_reporte=folio_reporte,
            cantidad_nna=datos.cantidad_nna,
            edad_aproximada=datos.edad_aproximada,
            tipo_trabajo=datos.tipo_trabajo,
            descripcion=datos.descripcion,
            imagen=datos.imagen,
        )

        db.add(nuevo_reporte)
        db.commit()
        db.refresh(nuevo_reporte)
        return nuevo_reporte
    except Exception:
        db.rollback()
        raise
