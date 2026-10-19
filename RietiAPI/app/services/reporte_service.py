from collections.abc import Callable
from datetime import datetime
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from botocore.exceptions import BotoCoreError, ClientError
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.municipio import Municipio
from app.models.reporte import EstatusSeguimiento, Reporte
from app.models.ubicacion import Ubicacion
from app.repositories import folio_contador_repository, reporte_repositorio
from app.schemas.reporte import (
    ActualizarReporte,
    AsociarReporteACaso,
    CambiarEstatusReporte,
    EliminarReportes,
    EliminarReportesResponse,
    EstatusReporteResponse,
    ImagenReporteResponse,
    ProyeccionReporte,
    ReporteCasoResponse,
    ReporteCreate,
    ReporteDetalle,
    ReporteEstatusCasoResponse,
    ReporteListado,
    UbicacionReporteDetalle,
    UbicacionReporteListado,
)
from app.services import logs_service
from app.services.s3_service import eliminar_imagen, generar_url_subida, generar_urls_lectura


def listar_reportes(
    *,
    db: Session,
    construir_url_imagen: Callable[[int], str],
    id_usuario: int | None = None,
    id_caso: int | None = None,
    proyeccion: ProyeccionReporte = ProyeccionReporte.COMPLETA,
) -> list[ReporteListado]:
    filas = reporte_repositorio.listar(
        db,
        id_usuario=id_usuario,
        id_caso=id_caso,
    )
    reducida = proyeccion == ProyeccionReporte.REDUCIDA
    return [
        ReporteListado(
            id_reporte=fila.id_reporte,
            id_usuario=None if reducida else fila.id_usuario,
            id_caso=fila.id_caso,
            folio_reporte=fila.folio_reporte,
            fecha_reporte=fila.fecha_reporte,
            descripcion=None if reducida else fila.descripcion,
            estatus_seguimiento=fila.estatus_seguimiento,
            cantidad_nna=fila.cantidad_nna,
            edad_aproximada=fila.edad_aproximada,
            tipo_trabajo=fila.tipo_trabajo,
            riesgo=fila.riesgo,
            imagen=(
                construir_url_imagen(fila.id_reporte)
                if fila.imagen_key is not None and proyeccion == ProyeccionReporte.COMPLETA
                else None
            ),
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
        id_usuario=fila.id_usuario,
        id_caso=fila.id_caso,
        folio_reporte=fila.folio_reporte,
        fecha_reporte=fila.fecha_reporte,
        descripcion=fila.descripcion,
        estatus_seguimiento=fila.estatus_seguimiento,
        cantidad_nna=fila.cantidad_nna,
        edad_aproximada=fila.edad_aproximada,
        tipo_trabajo=fila.tipo_trabajo,
        riesgo=fila.riesgo,
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


def _obtener_reporte_para_actualizar(db: Session, id_reporte: int) -> Reporte:
    reporte = reporte_repositorio.obtener_para_actualizar(db, id_reporte)
    if reporte is None:
        raise HTTPException(status_code=404, detail="El reporte no existe")
    return reporte


def _exigir_puede_reabrir(reporte: Reporte, es_administrador: bool) -> None:
    if reporte.estatus_seguimiento == EstatusSeguimiento.RECHAZADO and not es_administrador:
        raise HTTPException(
            status_code=403,
            detail="Sólo un administrador puede reabrir un reporte rechazado",
        )


def actualizar_reporte(
    *,
    db: Session,
    id_reporte: int,
    datos: ActualizarReporte,
    id_usuario_actual: int,
    es_administrador: bool,
) -> ReporteDetalle:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if datos.estatus_seguimiento not in (None, EstatusSeguimiento.RECHAZADO):
            _exigir_puede_reabrir(reporte, es_administrador)
        estatus_anterior = reporte.estatus_seguimiento

        valores = datos.model_dump(exclude_unset=True, exclude_none=True)
        for campo, valor in valores.items():
            setattr(reporte, campo, valor)

        if valores:
            db.flush()
        if reporte.estatus_seguimiento != estatus_anterior:
            logs_service.registrar_log(
                db,
                id_usuario_actual,
                "Cambio de estatus del reporte",
                "reporte",
                id_reporte,
                {"estatus_seguimiento": estatus_anterior},
                {"estatus_seguimiento": reporte.estatus_seguimiento},
            )
        respuesta = obtener_detalle_reporte(db=db, id_reporte=id_reporte)
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def cambiar_estatus_reporte(
    *,
    db: Session,
    id_reporte: int,
    datos: CambiarEstatusReporte,
    id_usuario_actual: int,
    es_administrador: bool,
) -> EstatusReporteResponse:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if datos.estatus_seguimiento != EstatusSeguimiento.RECHAZADO:
            _exigir_puede_reabrir(reporte, es_administrador)
        estatus_anterior = reporte.estatus_seguimiento

        if datos.estatus_seguimiento != estatus_anterior:
            reporte.estatus_seguimiento = datos.estatus_seguimiento
            db.flush()
            logs_service.registrar_log(
                db,
                id_usuario_actual,
                "Cambio de estatus del reporte",
                "reporte",
                id_reporte,
                {"estatus_seguimiento": estatus_anterior},
                {"estatus_seguimiento": reporte.estatus_seguimiento},
            )

        respuesta = EstatusReporteResponse(
            id_reporte=reporte.id_reporte,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def rechazar_reporte(
    *, db: Session, id_reporte: int, id_usuario_actual: int
) -> ReporteEstatusCasoResponse:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if reporte.estatus_seguimiento == EstatusSeguimiento.RECHAZADO:
            raise HTTPException(status_code=409, detail="El reporte ya está rechazado")
        if reporte.id_caso is not None:
            raise HTTPException(status_code=409, detail="El reporte ya pertenece a un caso")

        estatus_anterior = reporte.estatus_seguimiento
        reporte.estatus_seguimiento = EstatusSeguimiento.RECHAZADO
        db.flush()
        logs_service.registrar_log(
            db,
            id_usuario_actual,
            "Rechazo de reporte",
            "reporte",
            id_reporte,
            {"estatus_seguimiento": estatus_anterior},
            {"estatus_seguimiento": reporte.estatus_seguimiento},
        )

        respuesta = ReporteEstatusCasoResponse(
            id_reporte=reporte.id_reporte,
            id_caso=reporte.id_caso,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def reabrir_reporte(
    *, db: Session, id_reporte: int, id_usuario_actual: int
) -> ReporteEstatusCasoResponse:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if reporte.estatus_seguimiento != EstatusSeguimiento.RECHAZADO:
            raise HTTPException(status_code=409, detail="El reporte no está rechazado")

        estatus_anterior = reporte.estatus_seguimiento
        reporte.estatus_seguimiento = EstatusSeguimiento.RECIBIDO
        db.flush()
        logs_service.registrar_log(
            db,
            id_usuario_actual,
            "Reapertura de reporte",
            "reporte",
            id_reporte,
            {"estatus_seguimiento": estatus_anterior},
            {"estatus_seguimiento": reporte.estatus_seguimiento},
        )

        respuesta = ReporteEstatusCasoResponse(
            id_reporte=reporte.id_reporte,
            id_caso=reporte.id_caso,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def desvincular_reporte(
    *, db: Session, id_reporte: int, id_usuario_actual: int, es_administrador: bool
) -> ReporteEstatusCasoResponse:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if reporte.id_caso is None:
            raise HTTPException(status_code=409, detail="El reporte no pertenece a ningún caso")
        _exigir_puede_reabrir(reporte, es_administrador)

        antes = {
            "id_caso": reporte.id_caso,
            "estatus_seguimiento": reporte.estatus_seguimiento,
        }
        reporte.id_caso = None
        reporte.estatus_seguimiento = EstatusSeguimiento.EN_REVISION
        db.flush()
        logs_service.registrar_log(
            db,
            id_usuario_actual,
            "Desvinculación de reporte",
            "reporte",
            id_reporte,
            antes,
            {
                "id_caso": reporte.id_caso,
                "estatus_seguimiento": reporte.estatus_seguimiento,
            },
        )

        respuesta = ReporteEstatusCasoResponse(
            id_reporte=reporte.id_reporte,
            id_caso=reporte.id_caso,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


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
            riesgo=datos.riesgo,
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
    id_usuario_actual: int,
    es_administrador: bool,
) -> ReporteCasoResponse:
    try:
        reporte = _obtener_reporte_para_actualizar(db, id_reporte)
        if not reporte_repositorio.existe_caso(db, datos.id_caso):
            raise HTTPException(status_code=404, detail="El caso no existe")
        _exigir_puede_reabrir(reporte, es_administrador)

        antes = {
            "id_caso": reporte.id_caso,
            "estatus_seguimiento": reporte.estatus_seguimiento,
        }
        reporte.id_caso = datos.id_caso
        reporte.estatus_seguimiento = EstatusSeguimiento.CANALIZADO
        db.flush()
        logs_service.registrar_log(
            db,
            id_usuario_actual,
            "Fusión de reporte con caso",
            "reporte",
            id_reporte,
            antes,
            {
                "id_caso": reporte.id_caso,
                "estatus_seguimiento": reporte.estatus_seguimiento,
            },
        )

        respuesta = ReporteCasoResponse(
            id_reporte=reporte.id_reporte,
            id_caso=reporte.id_caso,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def eliminar_reportes(
    *,
    db: Session,
    datos: EliminarReportes,
    id_usuario_actual: int,
) -> EliminarReportesResponse:
    ids = list(dict.fromkeys(datos.ids))
    eliminados: list[int] = []
    omitidos: list[int] = []
    imagenes: list[str] = []
    try:
        reportes = {
            reporte.id_reporte: reporte
            for reporte in reporte_repositorio.obtener_para_eliminar(db, ids)
        }
        for id_reporte in ids:
            reporte = reportes.get(id_reporte)
            if (
                reporte is None
                or reporte.estatus_seguimiento != EstatusSeguimiento.RECHAZADO
            ):
                omitidos.append(id_reporte)
                continue

            id_ubicacion = reporte.id_ubicacion
            if reporte.imagen_key is not None:
                imagenes.append(reporte.imagen_key)
            resumen = {
                "folio_reporte": reporte.folio_reporte,
                "estatus_seguimiento": reporte.estatus_seguimiento,
                "id_caso": reporte.id_caso,
                "id_ubicacion": id_ubicacion,
            }
            reporte_repositorio.eliminar(db, reporte)
            if not reporte_repositorio.ubicacion_en_uso(db, id_ubicacion):
                reporte_repositorio.eliminar_ubicacion(db, id_ubicacion)
            logs_service.registrar_log(
                db,
                id_usuario_actual,
                "Eliminación de reporte",
                "reporte",
                id_reporte,
                resumen,
            )
            eliminados.append(id_reporte)

        db.flush()
        try:
            for imagen_key in imagenes:
                eliminar_imagen(imagen_key=imagen_key)
        except (ClientError, BotoCoreError) as error:
            raise HTTPException(
                status_code=502,
                detail="No se pudo eliminar la imagen en S3; vuelve a intentar el borrado",
            ) from error
        db.commit()
        return EliminarReportesResponse(eliminados=eliminados, omitidos=omitidos)
    except Exception:
        db.rollback()
        raise
