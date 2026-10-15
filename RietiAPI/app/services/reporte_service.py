from datetime import datetime
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from botocore.exceptions import BotoCoreError, ClientError
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.models.caso import Caso
from app.repositories import folio_contador_repository, reporte_repositorio
from app.schemas.reporte import ReporteCreate
from app.services.s3_service import generar_url_subida
from app.schemas.reporte import (
    AsociarReporteACaso,
    ImagenReporteResponse,
    ReporteDetalle,
    ReporteListado,
    UbicacionReporteDetalle,
    UbicacionReporteListado,
)
from app.services.s3_service import generar_urls_lectura


def listar_reportes(
    *,
    db: Session,
    solo_sin_caso: bool,
    limit: int,
    offset: int,
) -> list[ReporteListado]:
    filas = reporte_repositorio.listar(
        db,
        solo_sin_caso=solo_sin_caso,
        limit=limit,
        offset=offset,
    )
    return [
        ReporteListado(
            id_reporte=fila.id_reporte,
            id_caso=fila.id_caso,
            folio_reporte=fila.folio_reporte,
            fecha_reporte=fila.fecha_reporte,
            descripcion=fila.descripcion,
            estatus_seguimiento=fila.estatus_seguimiento,
            cantidad_nna=fila.cantidad_nna,
            edad_aproximada=fila.edad_aproximada,
            tipo_trabajo=fila.tipo_trabajo,
            ubicacion=UbicacionReporteListado(
                municipio=fila.municipio,
                colonia=fila.colonia,
                calle=fila.calle,
                lat=fila.lat,
                lng=fila.lng,
            ),
        )
        for fila in filas
    ]


def obtener_detalle_reporte(*, db: Session, id_reporte: int) -> ReporteDetalle:
    fila = reporte_repositorio.obtener_detalle(db, id_reporte)
    if fila is None:
        raise HTTPException(status_code=404, detail="El reporte no existe")

    return ReporteDetalle(
        id_reporte=fila.id_reporte,
        id_caso=fila.id_caso,
        folio_reporte=fila.folio_reporte,
        fecha_reporte=fila.fecha_reporte,
        descripcion=fila.descripcion,
        estatus_seguimiento=fila.estatus_seguimiento,
        cantidad_nna=fila.cantidad_nna,
        edad_aproximada=fila.edad_aproximada,
        tipo_trabajo=fila.tipo_trabajo,
        ubicacion=UbicacionReporteDetalle(
            municipio=fila.municipio,
            colonia=fila.colonia,
            calle=fila.calle,
            referencia=fila.referencia,
            lat=fila.lat,
            lng=fila.lng,
        ),
        tiene_imagen=fila.imagen_key is not None,
    )


def obtener_urls_imagen_reporte(
    *, db: Session, id_reporte: int
) -> ImagenReporteResponse:
    fila = reporte_repositorio.obtener_imagen_key(db, id_reporte)
    if fila is None:
        raise HTTPException(status_code=404, detail="El reporte no existe")
    if fila.imagen_key is None:
        raise HTTPException(status_code=404, detail="El reporte no tiene imagen")

    try:
        url_visualizacion, url_descarga = generar_urls_lectura(
            imagen_key=fila.imagen_key,
            id_reporte=id_reporte,
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") in (
            "404", "NoSuchKey", "NotFound"
        ):
            raise HTTPException(
                status_code=404,
                detail="La imagen todavía no está disponible",
            ) from error
        raise HTTPException(
            status_code=502,
            detail="No se pudo consultar la imagen en S3",
        ) from error
    except (BotoCoreError, ValueError) as error:
        raise HTTPException(
            status_code=502,
            detail="No se pudo consultar la imagen en S3",
        ) from error

    return ImagenReporteResponse(
        url_visualizacion=url_visualizacion,
        url_descarga=url_descarga,
        expira_en=settings.S3_PRESIGNED_URL_EXPIRES_IN,
    )


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


def asociar_reporte_a_caso(
    *,
    db: Session,
    id_reporte: int,
    datos: AsociarReporteACaso,
):
    try:
        reporte = (
            db.query(Reporte)
            .filter(Reporte.id_reporte == id_reporte)
            .with_for_update()
            .first()
        )
        if reporte is None:
            raise HTTPException(status_code=404, detail="El reporte no existe")

        caso = db.query(Caso).filter(Caso.id_caso == datos.id_caso).first()
        if caso is None:
            raise HTTPException(status_code=404, detail="El caso no existe")

        reporte.id_caso = caso.id_caso
        respuesta = {"id_reporte": reporte.id_reporte, "id_caso": caso.id_caso}
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise
