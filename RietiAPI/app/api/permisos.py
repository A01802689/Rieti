from app.models.caso import Estado
from app.models.reporte import EstatusSeguimiento
from app.schemas.caso import ActualizarCaso
from app.schemas.usuario import PermisoEnum

CIERRE_REPORTE = frozenset({EstatusSeguimiento.RECHAZADO, EstatusSeguimiento.CONCLUIDO})

MENSAJES_PERMISO = {
    PermisoEnum.reports_view: "No tienes permiso para ver los reportes",
    PermisoEnum.reports_view_detail: "No tienes permiso para ver el detalle de los reportes",
    PermisoEnum.reports_edit: "No tienes permiso para editar reportes",
    PermisoEnum.reports_close: "No tienes permiso para cerrar reportes",
    PermisoEnum.cases_view: "No tienes permiso para ver los casos",
    PermisoEnum.cases_edit: "No tienes permiso para editar casos ni agregar notas",
    PermisoEnum.cases_close: "No tienes permiso para cerrar casos",
    PermisoEnum.cases_assign: "No tienes permiso para asignar responsables",
    PermisoEnum.map_view: "No tienes permiso para ver el mapa de calor",
    PermisoEnum.stats_view: "No tienes permiso para ver las estadísticas",
    PermisoEnum.logs_view: "No tienes permiso para ver la bitácora",
}


def permisos_listado_reportes(id_caso: int | None) -> list[PermisoEnum]:
    permisos = [PermisoEnum.reports_view, PermisoEnum.map_view, PermisoEnum.stats_view]
    if id_caso is not None:
        permisos.append(PermisoEnum.cases_view)
    return permisos


def permisos_cambio_reporte(estatus: EstatusSeguimiento | None) -> set[PermisoEnum]:
    if estatus is None:
        return {PermisoEnum.reports_edit}
    if estatus in CIERRE_REPORTE:
        return {PermisoEnum.reports_close}
    return {PermisoEnum.reports_edit}


def permisos_cambio_caso(datos: ActualizarCaso) -> set[PermisoEnum]:
    requeridos = set()
    if datos.estado is not None:
        requeridos.add(
            PermisoEnum.cases_close if datos.estado == Estado.CERRADO else PermisoEnum.cases_edit
        )
    otros = (
        datos.urgencia,
        datos.cantidad_nna,
        datos.edad_aproximada,
        datos.tipo_trabajo,
        datos.ubicacion,
    )
    if any(valor is not None for valor in otros):
        requeridos.add(PermisoEnum.cases_edit)
    return requeridos or {PermisoEnum.cases_edit}
