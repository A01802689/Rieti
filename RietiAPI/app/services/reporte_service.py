from datetime import datetime
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.repositories import folio_contador_repository
from app.schemas.reporte import ReporteCreate
from app.services.s3_service import generar_url_subida


def create_reporte(
    *,
    db: Session,
    datos: ReporteCreate,
    id_usuario_actual: int,
):
    municipio = (
        db.query(Municipio)
        .filter(Municipio.nombre == datos.ubicacion.municipio)
        .first()
    )

    if municipio is None:
        raise HTTPException(
            status_code=404,
            detail="El municipio no existe",
        )

    try:
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

        anio = datetime.now(ZoneInfo("America/Mexico_City")).year
        consecutivo = folio_contador_repository.obtener_siguiente_consecutivo(
            db=db,
            id_municipio=municipio.id_municipio,
            anio=anio,
        )
        folio_reporte = f"RIETI-{municipio.clave}-{anio}-{consecutivo:06d}"

        nuevo_reporte = Reporte(
            id_usuario=(
                id_usuario_actual
                if datos.con_seguimiento
                else None
            ),
            id_ubicacion=nueva_ubicacion.id_ubicacion,
            folio_reporte=folio_reporte,
            cantidad_nna=datos.cantidad_nna,
            edad_aproximada=datos.edad_aproximada,
            tipo_trabajo=datos.tipo_trabajo,
            descripcion=datos.descripcion,
            imagen_key=None,
        )
        db.add(nuevo_reporte)
        db.flush()

        url_subida_imagen = None

        if datos.imagen_content_type is not None:
            extension_por_tipo = {
                "image/jpeg": "jpg",
                "image/png": "png",
            }
            extension = extension_por_tipo[datos.imagen_content_type]
            imagen_key = (
                f"reportes/{nuevo_reporte.id_reporte}/{uuid4()}.{extension}"
            )

            nuevo_reporte.imagen_key = imagen_key
            url_subida_imagen = generar_url_subida(
                imagen_key=imagen_key,
                content_type=datos.imagen_content_type,
            )

        db.commit()
        db.refresh(nuevo_reporte)

        return {
            "id_reporte": nuevo_reporte.id_reporte,
            "folio_reporte": nuevo_reporte.folio_reporte,
            "id_usuario": nuevo_reporte.id_usuario,
            "id_caso": nuevo_reporte.id_caso,
            "id_ubicacion": nuevo_reporte.id_ubicacion,
            "url_subida_imagen": url_subida_imagen,
            "url_subida_expira_en": (
                settings.S3_PRESIGNED_URL_EXPIRES_IN
                if url_subida_imagen is not None
                else None
            ),
        }
    except Exception:
        db.rollback()
        raise