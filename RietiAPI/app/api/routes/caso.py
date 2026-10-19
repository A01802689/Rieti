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

router = APIRouter(prefix="/reportes", tags=["Casos"])
casos_router = APIRouter(prefix="/casos", tags=["Casos"])


@casos_router.get(
    "",
    response_model=list[CasoListado],
    dependencies=[Depends(exigir_permiso(
        PermisoEnum.cases_view, PermisoEnum.map_view, PermisoEnum.stats_view,
    ))],
)
def listar_casos(db: Session = Depends(get_db)):
    return caso_service.listar_casos(db=db)


@casos_router.get(
    "/{id_caso}",
    response_model=CasoDetalle,
    dependencies=[Depends(exigir_permiso(PermisoEnum.cases_view))],
)
def obtener_caso(id_caso: int, db: Session = Depends(get_db)):
    return caso_service.obtener_caso(db=db, id_caso=id_caso)


@casos_router.patch("/{id_caso}", response_model=CasoDetalle)
def actualizar_caso(
    id_caso: int,
    datos: ActualizarCaso,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_personal),
):
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
    return caso_service.abrir_caso_desde_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
        id_usuario_actual=usuario_actual.id_usuario,
    )
