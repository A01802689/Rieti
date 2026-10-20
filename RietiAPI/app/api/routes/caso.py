from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    exigir_administrador,
    exigir_permiso,
    exigir_personal,
    exigir_todos,
    get_db,
)
from app.api.permisos import permisos_cambio_caso
from app.models.usuario import Usuario
from app.schemas.caso import (
    AbrirCasoDesdeReporte, ActualizarCaso, CasoAbiertoResponse, CasoListado, CasoDetalle,
    EliminarCasos, EliminarCasosResponse, TransferirCaso,
)
from app.schemas.usuario import PermisoEnum
from app.services import caso_service

#: router de la acción de abrir un caso, cuelga de /reportes porque parte de un reporte
router = APIRouter(prefix="/reportes", tags=["Casos"])
#: router del resto de operaciones sobre casos
casos_router = APIRouter(prefix="/casos", tags=["Casos"])


@casos_router.get(
    "",
    response_model=list[CasoListado],
    dependencies=[Depends(exigir_permiso(
        PermisoEnum.cases_view, PermisoEnum.map_view, PermisoEnum.stats_view,
    ))],
)
def listar_casos(db: Session = Depends(get_db)):
    """Lista todos los casos con su número de reportes, requiere cases.view, map.view o stats.view

    Args:
        db: sesión de base de datos

    Returns:
        Casos del más reciente al más antiguo

    Raises:
        HTTPException: 401 sin sesión, 403 sin ninguno de los permisos
    """
    return caso_service.listar_casos(db=db)


@casos_router.get(
    "/{id_caso}",
    response_model=CasoDetalle,
    dependencies=[Depends(exigir_permiso(PermisoEnum.cases_view))],
)
def obtener_caso(id_caso: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un caso con sus seguimientos, requiere cases.view

    Args:
        id_caso: identificador del caso
        db: sesión de base de datos

    Returns:
        Detalle del caso, su última nota y sus seguimientos por consecutivo

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el caso no existe
    """
    return caso_service.obtener_caso(db=db, id_caso=id_caso)


@casos_router.patch("/{id_caso}", response_model=CasoDetalle)
def actualizar_caso(
    id_caso: int,
    datos: ActualizarCaso,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_personal),
):
    """Actualiza estado, urgencia, datos del caso o su ubicación, requiere cases.edit o cases.close si el estado pasa a Cerrado

    Args:
        id_caso: identificador del caso
        datos: campos a cambiar, los omitidos no se tocan
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Detalle del caso actualizado

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el caso no existe
    """
    exigir_todos(usuario_actual, permisos_cambio_caso(datos))

    return caso_service.actualizar_caso(
        db=db,
        id_caso=id_caso,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )


@casos_router.put("/{id_caso}/transferir", response_model=CasoDetalle)
def transferir_caso(
    id_caso: int,
    datos: TransferirCaso,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.cases_assign)),
):
    """Transfiere un caso a otro municipio, requiere cases.assign

    Args:
        id_caso: identificador del caso
        datos: municipio que recibe el caso
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Detalle del caso transferido

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el caso o el municipio no existen
    """
    return caso_service.transferir_caso(
        db=db,
        id_caso=id_caso,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )


@casos_router.delete("", response_model=EliminarCasosResponse)
def eliminar_casos(
    datos: EliminarCasos,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Elimina varios casos, requiere rol Administrador

    Solo se eliminan los casos cerrados, los demás se devuelven como omitidos

    Args:
        datos: identificadores de los casos a eliminar
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Identificadores eliminados y omitidos

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador
    """
    return caso_service.eliminar_casos(
        db=db,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )


@router.post(
    "/{id_reporte}/abrir-caso",
    response_model=CasoAbiertoResponse,
    status_code=status.HTTP_201_CREATED,
)
def abrir_caso(
    id_reporte: int,
    datos: AbrirCasoDesdeReporte | None = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_permiso(PermisoEnum.reports_edit)),
):
    """Abre un caso a partir de un reporte y lo deja Canalizado, requiere reports.edit

    Sin cuerpo, el caso toma el municipio del reporte y una ubicación nueva solo con ese municipio

    Args:
        id_reporte: identificador del reporte
        datos: municipio, ubicación y urgencia opcionales del caso
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Caso abierto con su estatus de reporte

    Raises:
        HTTPException: 401 sin sesión, 403 sin el permiso, 404 si el reporte o el municipio no existen, 409 si el reporte ya tiene caso o está rechazado
    """
    return caso_service.abrir_caso_desde_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )
