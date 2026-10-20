from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import (
    exigir_administrador,
    exigir_alguno,
    exigir_permiso,
    exigir_personal,
    exigir_todos,
    get_current_user,
    get_db,
    proyeccion_reportes,
)
from app.api.permisos import permisos_cambio_reporte, permisos_listado_reportes
from app.models.usuario import Usuario
from app.schemas.reporte import (
    AsociarReporteACaso,
    ActualizarReporte,
    CambiarEstatusReporte,
    EliminarReportes,
    EliminarReportesResponse,
    EstatusReporteResponse,
    ImagenReporteResponse,
    ReporteCasoResponse,
    ReporteCreate,
    ReporteDetalle,
    ReporteEstatusCasoResponse,
    ReporteListado,
    ReporteResponse,
)
from app.schemas.usuario import PermisoEnum
from app.services import reporte_service

router = APIRouter(prefix="/reportes",tags=["Reportes"] )

#: dependencia compartida por las tres rutas de imagen, acepta reports.view, reports.view_detail o cases.view
exigir_lectura_imagen = exigir_permiso(
    PermisoEnum.reports_view,
    PermisoEnum.reports_view_detail,
    PermisoEnum.cases_view,
)


def _agregar_urls_imagen(detalle: ReporteDetalle, request: Request) -> ReporteDetalle:
    """Agrega al detalle las rutas estables de visualización y descarga de la imagen, si el reporte tiene una

    Args:
        detalle: detalle del reporte que se completa
        request: petición HTTP con la que se construyen las URL absolutas

    Returns:
        El mismo detalle, con imagen y url_descarga_imagen cuando tiene imagen
    """
    if detalle.tiene_imagen:
        detalle.imagen = str(
            request.url_for("ver_imagen_reporte", id_reporte=detalle.id_reporte)
        )
        detalle.url_descarga_imagen = str(
            request.url_for("descargar_imagen_reporte", id_reporte=detalle.id_reporte)
        )
    return detalle


@router.get("/", response_model=list[ReporteListado], include_in_schema=False)
@router.get("", response_model=list[ReporteListado])
def listar_reportes(
    request: Request,
    id_caso: int | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """Lista los reportes, los propios para un ciudadano y todos para el personal

    El personal requiere reports.view, map.view o stats.view (con id_caso también vale cases.view)
    y sin reports.view ni reports.view_detail recibe una versión reducida sin descripción, usuario ni imagen

    Args:
        request: petición HTTP con la que se construyen las URL de imagen
        id_caso: filtra por caso, solo lo aplica el personal
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Reportes ordenados del más reciente al más antiguo

    Raises:
        HTTPException: 401 sin sesión, 403 si el personal no tiene ninguno de los permisos
    """
    es_personal = usuario_actual.rol is not None
    if es_personal:
        exigir_alguno(usuario_actual, *permisos_listado_reportes(id_caso))

    return reporte_service.listar_reportes(
        db=db,
        construir_url_imagen=lambda id_reporte: str(
            request.url_for("ver_imagen_reporte", id_reporte=id_reporte)
        ),
        id_usuario=None if es_personal else usuario_actual.id_usuario,
        id_caso=id_caso if es_personal else None,
        proyeccion=proyeccion_reportes(usuario_actual, id_caso),
    )


@router.get(
    "/{id_reporte}",
    response_model=ReporteDetalle,
    dependencies=[Depends(exigir_permiso(PermisoEnum.reports_view_detail))],
)
def obtener_reporte(
    id_reporte: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Obtiene el detalle de un reporte, requiere reports.view_detail

    Args:
        id_reporte: identificador del reporte
        request: petición HTTP con la que se construyen las URL de imagen
        db: sesión de base de datos

    Returns:
        Detalle del reporte con ubicación y rutas de imagen

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte no existe
    """
    detalle = reporte_service.obtener_detalle_reporte(db=db, id_reporte=id_reporte)
    return _agregar_urls_imagen(detalle, request)


@router.patch("/{id_reporte}", response_model=ReporteDetalle)
def actualizar_reporte(
    id_reporte: int,
    datos: ActualizarReporte,
    request: Request,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_personal),
):
    """Actualiza el estatus y el riesgo de un reporte, requiere reports.edit o reports.close si el estatus lo cierra

    Sacar un reporte de Rechazado solo lo puede hacer un administrador

    Args:
        id_reporte: identificador del reporte
        datos: campos a cambiar, los omitidos no se tocan
        request: petición HTTP con la que se construyen las URL de imagen
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Detalle del reporte actualizado

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso o si reabre un reporte rechazado sin ser administrador, 404 si el reporte no existe
    """
    exigir_todos(usuario_actual, permisos_cambio_reporte(datos.estatus_seguimiento))

    detalle = reporte_service.actualizar_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
        es_administrador=usuario_actual.rol == "Administrador",
    )
    return _agregar_urls_imagen(detalle, request)


@router.patch("/{id_reporte}/estatus", response_model=EstatusReporteResponse)
def cambiar_estatus_reporte(
    id_reporte: int,
    datos: CambiarEstatusReporte,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_personal),
):
    """Cambia solo el estatus de un reporte, requiere reports.edit o reports.close si el estatus lo cierra

    Sacar un reporte de Rechazado solo lo puede hacer un administrador

    Args:
        id_reporte: identificador del reporte
        datos: nuevo estatus
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificador y estatus resultante del reporte

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso o si reabre un reporte rechazado sin ser administrador, 404 si el reporte no existe
    """
    exigir_todos(usuario_actual, permisos_cambio_reporte(datos.estatus_seguimiento))

    return reporte_service.cambiar_estatus_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
        es_administrador=usuario_actual.rol == "Administrador",
    )


@router.post("/{id_reporte}/rechazar", response_model=ReporteEstatusCasoResponse)
def rechazar_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.reports_close)),
):
    """Rechaza un reporte que no pertenece a ningún caso, requiere reports.close

    Args:
        id_reporte: identificador del reporte
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificador, caso y estatus resultante del reporte

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte no existe, 409 si ya está rechazado o ya pertenece a un caso
    """
    return reporte_service.rechazar_reporte(
        db=db,
        id_reporte=id_reporte,
        id_usuario_actual=usuario_actual.id_usuario,
    )


@router.post("/{id_reporte}/reabrir", response_model=ReporteEstatusCasoResponse)
def reabrir_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Reabre un reporte rechazado y lo regresa a Recibido, requiere rol Administrador

    Args:
        id_reporte: identificador del reporte
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificador, caso y estatus resultante del reporte

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 404 si el reporte no existe, 409 si no está rechazado
    """
    return reporte_service.reabrir_reporte(
        db=db,
        id_reporte=id_reporte,
        id_usuario_actual=usuario_actual.id_usuario,
    )


@router.post("/{id_reporte}/desvincular", response_model=ReporteEstatusCasoResponse)
def desvincular_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.reports_edit)),
):
    """Saca un reporte de su caso y lo deja En revisión, requiere reports.edit

    Args:
        id_reporte: identificador del reporte
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificador, caso y estatus resultante del reporte

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso o si el reporte está rechazado y no es administrador, 404 si el reporte no existe, 409 si no pertenece a ningún caso
    """
    return reporte_service.desvincular_reporte(
        db=db,
        id_reporte=id_reporte,
        id_usuario_actual=usuario_actual.id_usuario,
        es_administrador=usuario_actual.rol == "Administrador",
    )


@router.get(
    "/{id_reporte}/imagen",
    response_model=ImagenReporteResponse,
    dependencies=[Depends(exigir_lectura_imagen)],
)
def obtener_imagen_reporte(
    id_reporte: int,
    response: Response,
    db: Session = Depends(get_db),
):
    """Obtiene URL prefirmadas de visualización y descarga de la imagen de un reporte, requiere reports.view, reports.view_detail o cases.view

    Args:
        id_reporte: identificador del reporte
        response: respuesta HTTP a la que se agrega Cache-Control en no-store
        db: sesión de base de datos

    Returns:
        URL temporales de visualización y descarga, con su tiempo de expiración

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte no existe, no tiene imagen o la imagen aún no está en S3, 502 si falla S3
    """
    resultado = reporte_service.obtener_urls_imagen_reporte(
        db=db, id_reporte=id_reporte
    )
    response.headers["Cache-Control"] = "no-store"
    return resultado


@router.get(
    "/{id_reporte}/imagen/ver",
    response_class=RedirectResponse,
    status_code=status.HTTP_302_FOUND,
    dependencies=[Depends(exigir_lectura_imagen)],
)
def ver_imagen_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
):
    """Redirige a una URL prefirmada nueva para ver la imagen de un reporte, requiere reports.view, reports.view_detail o cases.view

    Args:
        id_reporte: identificador del reporte
        db: sesión de base de datos

    Returns:
        Redirección 302 a la imagen en S3

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte no existe, no tiene imagen o la imagen aún no está en S3, 502 si falla S3
    """
    enlaces = reporte_service.obtener_urls_imagen_reporte(
        db=db, id_reporte=id_reporte
    )
    return RedirectResponse(
        url=enlaces.url_visualizacion,
        status_code=status.HTTP_302_FOUND,
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
    )


@router.get(
    "/{id_reporte}/imagen/descargar",
    response_class=RedirectResponse,
    status_code=status.HTTP_302_FOUND,
    dependencies=[Depends(exigir_lectura_imagen)],
)
def descargar_imagen_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
):
    """Redirige a una URL prefirmada nueva para descargar la imagen de un reporte, requiere reports.view, reports.view_detail o cases.view

    Args:
        id_reporte: identificador del reporte
        db: sesión de base de datos

    Returns:
        Redirección 302 a la descarga en S3

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte no existe, no tiene imagen o la imagen aún no está en S3, 502 si falla S3
    """
    enlaces = reporte_service.obtener_urls_imagen_reporte(
        db=db, id_reporte=id_reporte
    )
    return RedirectResponse(
        url=enlaces.url_descarga,
        status_code=status.HTTP_302_FOUND,
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
    )


@router.post(
    "/",
    response_model=ReporteResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "",
    response_model=ReporteResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_reporte(
    datos: ReporteCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    """Crea un reporte nuevo, solo para ciudadanos con sesión (usuarios sin rol)

    Si se pide imagen, la respuesta incluye una URL prefirmada para subirla a S3

    Args:
        datos: datos del reporte y su ubicación
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificadores y folio del reporte creado, con la URL de subida de imagen si se pidió

    Raises:
        HTTPException: 401 sin sesión, 403 si el usuario tiene rol, 404 si el municipio no existe
    """

    if usuario_actual.rol is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sólo los usuarios sin rol pueden crear reportes",
        )

    return reporte_service.create_reporte(
        db=db,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )

@router.put("/{id_reporte}/caso", response_model=ReporteCasoResponse)
def asociar_reporte_a_caso(
    id_reporte: int,
    datos: AsociarReporteACaso,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.reports_edit)),
):
    """Asocia un reporte a un caso existente y lo deja Canalizado, requiere reports.edit

    Args:
        id_reporte: identificador del reporte
        datos: caso al que se asocia
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificador, caso y estatus resultante del reporte

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso o si el reporte está rechazado y no es administrador, 404 si el reporte o el caso no existen
    """
    return reporte_service.asociar_reporte_a_caso(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
        es_administrador=usuario_actual.rol == "Administrador",
    )


@router.delete("", response_model=EliminarReportesResponse)
def eliminar_reportes(
    datos: EliminarReportes,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Elimina varios reportes, requiere rol Administrador

    Solo se eliminan los reportes rechazados, los demás se devuelven como omitidos

    Args:
        datos: identificadores de los reportes a eliminar
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificadores eliminados y omitidos

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 502 si falla el borrado de la imagen en S3
    """
    return reporte_service.eliminar_reportes(
        db=db,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )
