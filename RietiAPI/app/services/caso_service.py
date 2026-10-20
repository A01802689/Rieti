from fastapi import HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.models.caso import Caso, Estado
from app.models.reporte import CantidadNNA, EstatusSeguimiento
from app.models.ubicacion import Ubicacion
from app.schemas.caso import (
    AbrirCasoDesdeReporte, ActualizarCaso, CasoAbiertoResponse,
    CasoListado, CasoDetalle, EliminarCasos, EliminarCasosResponse,
    MunicipioCasoResponse, TransferirCaso, UbicacionCasoResponse,
)
from app.schemas.seguimiento import SeguimientoResponse
from app.repositories import caso_repository, municipio_repository
from app.services import logs_service


def abrir_caso_desde_reporte(
    *,
    db: Session,
    id_reporte: int,
    datos: AbrirCasoDesdeReporte | None,
    id_usuario_actual: int,
) -> CasoAbiertoResponse:
    """Abre un caso a partir de un reporte y lo canaliza

    Crea una ubicación propia del caso (solo con el municipio si no se envía una), el caso en estado Abierto
    y deja el reporte en Canalizado con el bloqueo de fila activo hasta el commit

    Args:
        db: sesión de base de datos
        id_reporte: identificador del reporte que origina el caso
        datos: municipio, ubicación y urgencia opcionales del caso; None equivale a todo vacío
        id_usuario_actual: identificador de quien abre el caso, se registra en la bitácora

    Returns:
        El caso abierto con el estatus de seguimiento del reporte

    Raises:
        HTTPException: 404 si el reporte no existe
        HTTPException: 409 si el reporte ya pertenece a un caso o está rechazado
        HTTPException: 404 si el municipio indicado no existe
    """
    if datos is None:
        datos = AbrirCasoDesdeReporte()
    try:
        reporte = caso_repository.obtener_reporte_para_actualizar(db, id_reporte)
        if reporte is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El reporte no existe",
            )
        if reporte.id_caso is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El reporte ya pertenece a un caso",
            )
        if reporte.estatus_seguimiento == "Rechazado":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El reporte está rechazado",
            )

        if datos.id_municipio is not None:
            municipio = municipio_repository.get_by_id(db, datos.id_municipio)
            if municipio is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="El municipio no existe",
                )
            id_municipio = municipio.id_municipio
        else:
            id_municipio = caso_repository.obtener_id_municipio_ubicacion(
                db, reporte.id_ubicacion
            )

        ubicacion = Ubicacion(id_municipio=id_municipio)
        if datos.ubicacion is not None:
            ubicacion.colonia = datos.ubicacion.colonia
            ubicacion.calle = datos.ubicacion.calle
            ubicacion.coordenadas = WKTElement(
                f"POINT({datos.ubicacion.longitud} {datos.ubicacion.latitud})",
                srid=4326,
            )
            ubicacion.referencia = datos.ubicacion.referencia
        db.add(ubicacion)
        db.flush()

        caso = Caso(
            id_municipio=id_municipio,
            id_ubicacion=ubicacion.id_ubicacion,
            estado=Estado.ABIERTO,
            urgencia=datos.urgencia,
        )
        db.add(caso)
        db.flush()

        reporte.id_caso = caso.id_caso
        reporte.estatus_seguimiento = EstatusSeguimiento.CANALIZADO
        db.flush()

        respuesta = CasoAbiertoResponse(
            id_caso=caso.id_caso,
            id_reporte=reporte.id_reporte,
            id_municipio=caso.id_municipio,
            id_ubicacion=caso.id_ubicacion,
            estado=caso.estado,
            urgencia=caso.urgencia,
            cantidad_nna=caso.cantidad_nna,
            edad_aproximada=caso.edad_aproximada,
            tipo_trabajo=caso.tipo_trabajo,
            estatus_seguimiento=reporte.estatus_seguimiento,
        )
        logs_service.registrar_log(
            db=db,
            id_usuario=id_usuario_actual,
            action="Apertura de caso",
            entity_type="caso",
            id_registro_afectado=caso.id_caso,
            before_data={},
            after_data={
                "id_reporte": reporte.id_reporte,
                "estatus_seguimiento": reporte.estatus_seguimiento,
                "id_municipio": caso.id_municipio,
                "urgencia": caso.urgencia,
            },
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def _datos_publicos(fila):
    """Convierte una fila de la consulta de casos en los campos comunes del listado y del detalle

    Args:
        fila: fila con el caso, los nombres de municipio, la ubicación, las coordenadas y el conteo de reportes

    Returns:
        Diccionario con los campos de CasoListado
    """
    caso = fila.Caso
    return dict(
        id_caso=caso.id_caso,
        municipio=MunicipioCasoResponse(nombre=fila.municipio),
        ubicacion=UbicacionCasoResponse(
            municipio=fila.municipio_ubicacion, colonia=fila.colonia,
            calle=fila.calle, lat=fila.lat, lng=fila.lng,
        ),
        estado=caso.estado, fecha_caso=caso.fecha_caso, urgencia=caso.urgencia,
        cantidad_nna=caso.cantidad_nna, edad_aproximada=caso.edad_aproximada,
        tipo_trabajo=caso.tipo_trabajo, cantidad_reportes=fila.cantidad_reportes,
    )


def listar_casos(*, db: Session) -> list[CasoListado]:
    """Lista todos los casos, del más reciente al más antiguo

    Args:
        db: sesión de base de datos

    Returns:
        Los casos sin notas ni seguimientos
    """
    return [CasoListado(**_datos_publicos(fila)) for fila in caso_repository.listar(db)]


def obtener_caso(*, db: Session, id_caso: int) -> CasoDetalle:
    """Obtiene el detalle de un caso con sus seguimientos

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        El caso con seguimientos ordenados por consecutivo y la última nota (None si no hay seguimientos)

    Raises:
        HTTPException: 404 si el caso no existe
    """
    fila = caso_repository.obtener_detalle(db, id_caso)
    if fila is None:
        raise HTTPException(status_code=404, detail="El caso no existe")
    seguimientos = [
        SeguimientoResponse(
            folio=registro.Seguimiento.folio, fecha=registro.Seguimiento.fecha,
            tipo=registro.Seguimiento.tipo,
            autor=f"{registro.nombre} {registro.apellido}".strip(),
            nota=registro.Seguimiento.nota,
        )
        for registro in caso_repository.listar_seguimientos(db, id_caso)
    ]
    return CasoDetalle(
        **_datos_publicos(fila), seguimientos=seguimientos,
        notas=seguimientos[-1].nota if seguimientos else None,
    )


def _diferencias(antes: dict, despues: dict) -> tuple[dict, dict]:
    """Calcula qué campos cambiaron para guardar solo esos valores en la bitácora

    Args:
        antes: valores anteriores
        despues: valores nuevos

    Returns:
        Tupla con los valores anteriores y los nuevos de los campos que difieren
    """
    campos = [campo for campo, valor in despues.items() if antes.get(campo) != valor]
    return (
        {campo: antes.get(campo) for campo in campos},
        {campo: despues[campo] for campo in campos},
    )


def _actualizar_ubicacion(db: Session, caso: Caso, valores: dict) -> tuple[dict, dict]:
    """Aplica los cambios de ubicación a la ubicación propia del caso

    Args:
        db: sesión de base de datos
        caso: caso cuya ubicación se modifica
        valores: campos de ubicación a cambiar, con lat y lng siempre juntos

    Returns:
        Tupla con los valores anteriores y los nuevos de los campos que cambiaron
    """
    actual = caso_repository.obtener_datos_ubicacion(db, caso.id_ubicacion)
    ubicacion = caso_repository.obtener_ubicacion(db, caso.id_ubicacion)
    for campo in ("colonia", "calle", "referencia"):
        if campo in valores:
            setattr(ubicacion, campo, valores[campo])
    if "lat" in valores:
        ubicacion.coordenadas = WKTElement(
            f"POINT({valores['lng']} {valores['lat']})", srid=4326
        )
    return _diferencias(actual._asdict(), valores)


def actualizar_caso(
    *, db: Session, id_caso: int, datos: ActualizarCaso, id_usuario_actual: int
) -> CasoDetalle:
    """Actualiza estado, urgencia, datos confirmados o ubicación de un caso

    Los campos omitidos o None se ignoran y cada cambio queda en la bitácora

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso
        datos: campos a modificar
        id_usuario_actual: identificador de quien modifica, se registra en la bitácora

    Returns:
        El detalle del caso ya actualizado

    Raises:
        HTTPException: 404 si el caso no existe
    """
    try:
        caso = caso_repository.obtener_para_actualizar(db, id_caso)
        if caso is None:
            raise HTTPException(status_code=404, detail="El caso no existe")
        valores = datos.model_dump(exclude_unset=True, exclude_none=True)
        valores_ubicacion = valores.pop("ubicacion", None)
        if "cantidad_nna" in valores:
            valores["cantidad_nna"] = CantidadNNA(str(valores["cantidad_nna"]))
        antes_caso, despues_caso = _diferencias(
            {campo: getattr(caso, campo) for campo in valores}, valores
        )
        for campo, valor in valores.items():
            setattr(caso, campo, valor)
        antes_ubicacion, despues_ubicacion = {}, {}
        if valores_ubicacion:
            antes_ubicacion, despues_ubicacion = _actualizar_ubicacion(
                db, caso, valores_ubicacion
            )
        if valores or valores_ubicacion:
            db.flush()
        # Construir y validar la respuesta antes de confirmar la transacción.
        respuesta = obtener_caso(db=db, id_caso=id_caso)
        if despues_caso:
            logs_service.registrar_log(
                db=db,
                id_usuario=id_usuario_actual,
                action="Cambio de datos del caso",
                entity_type="caso",
                id_registro_afectado=id_caso,
                before_data=antes_caso,
                after_data=despues_caso,
            )
        if despues_ubicacion:
            logs_service.registrar_log(
                db=db,
                id_usuario=id_usuario_actual,
                action="Cambio de ubicación del caso",
                entity_type="caso",
                id_registro_afectado=id_caso,
                before_data=antes_ubicacion,
                after_data=despues_ubicacion,
            )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def transferir_caso(
    *, db: Session, id_caso: int, datos: TransferirCaso, id_usuario_actual: int
) -> CasoDetalle:
    """Cambia el municipio responsable de un caso sin crear seguimientos

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso
        datos: municipio destino
        id_usuario_actual: identificador de quien transfiere, se registra en la bitácora

    Returns:
        El detalle del caso con el municipio nuevo

    Raises:
        HTTPException: 404 si el caso no existe
        HTTPException: 404 si el municipio destino no existe
    """
    try:
        caso = caso_repository.obtener_para_actualizar(db, id_caso)
        if caso is None:
            raise HTTPException(status_code=404, detail="El caso no existe")
        municipio = municipio_repository.get_by_id(db, datos.id_municipio)
        if municipio is None:
            raise HTTPException(status_code=404, detail="El municipio no existe")

        antes = None
        if caso.id_municipio != municipio.id_municipio:
            anterior = municipio_repository.get_by_id(db, caso.id_municipio)
            antes = {"id_municipio": anterior.id_municipio, "municipio": anterior.nombre}
            caso.id_municipio = municipio.id_municipio
            db.flush()
        respuesta = obtener_caso(db=db, id_caso=id_caso)
        if antes is not None:
            logs_service.registrar_log(
                db=db,
                id_usuario=id_usuario_actual,
                action="Transferencia de caso",
                entity_type="caso",
                id_registro_afectado=id_caso,
                before_data=antes,
                after_data={
                    "id_municipio": municipio.id_municipio,
                    "municipio": municipio.nombre,
                },
            )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def eliminar_casos(
    *, db: Session, datos: EliminarCasos, id_usuario_actual: int
) -> EliminarCasosResponse:
    """Elimina en lote los casos cerrados y omite los demás

    Libera sus reportes, borra seguimientos y asignaciones, y elimina las ubicaciones que queden sin uso

    Args:
        db: sesión de base de datos
        datos: identificadores de los casos a eliminar
        id_usuario_actual: identificador de quien elimina, se registra en la bitácora

    Returns:
        Los identificadores eliminados y los omitidos
    """
    ids = sorted(set(datos.ids))
    try:
        eliminables = [
            caso
            for caso in caso_repository.listar_para_eliminar(db, ids)
            if caso.estado == Estado.CERRADO
        ]
        ids_eliminables = [caso.id_caso for caso in eliminables]
        if eliminables:
            reportes_por_caso: dict[int, list[int]] = {}
            for id_caso, id_reporte in caso_repository.listar_reportes_de_casos(
                db, ids_eliminables
            ):
                reportes_por_caso.setdefault(id_caso, []).append(id_reporte)
            seguimientos_por_caso = dict(
                caso_repository.contar_seguimientos_de_casos(db, ids_eliminables)
            )
            resumenes = {
                caso.id_caso: {
                    "estado": caso.estado,
                    "id_municipio": caso.id_municipio,
                    "urgencia": caso.urgencia,
                    "fecha_caso": caso.fecha_caso,
                    "id_reportes": reportes_por_caso.get(caso.id_caso, []),
                    "seguimientos": seguimientos_por_caso.get(caso.id_caso, 0),
                }
                for caso in eliminables
            }
            ids_ubicacion = list({caso.id_ubicacion for caso in eliminables})

            caso_repository.liberar_reportes(db, ids_eliminables)
            caso_repository.eliminar_seguimientos(db, ids_eliminables)
            caso_repository.eliminar_usuarios_caso(db, ids_eliminables)
            caso_repository.eliminar_casos(db, eliminables)
            caso_repository.eliminar_ubicaciones_sin_uso(db, ids_ubicacion)

            for id_caso in ids_eliminables:
                logs_service.registrar_log(
                    db=db,
                    id_usuario=id_usuario_actual,
                    action="Eliminación de caso",
                    entity_type="caso",
                    id_registro_afectado=id_caso,
                    before_data=resumenes[id_caso],
                )
        db.commit()
        return EliminarCasosResponse(
            eliminados=ids_eliminables,
            omitidos=[id_caso for id_caso in ids if id_caso not in ids_eliminables],
        )
    except Exception:
        db.rollback()
        raise
