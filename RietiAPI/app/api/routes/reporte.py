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

exigir_lectura_imagen = exigir_permiso(
    PermisoEnum.reports_view,
    PermisoEnum.reports_view_detail,
    PermisoEnum.cases_view,
)


def _agregar_urls_imagen(detalle: ReporteDetalle, request: Request) -> ReporteDetalle:
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
    return reporte_service.eliminar_reportes(
        db=db,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )
