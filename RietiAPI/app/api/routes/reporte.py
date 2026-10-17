from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.reporte import (
    AsociarReporteACaso,
    ActualizarReporte,
    ImagenReporteResponse,
    ReporteCasoResponse,
    ReporteCreate,
    ReporteDetalle,
    ReporteListado,
    ReporteResponse,
)
from app.services import reporte_service

router = APIRouter(prefix="/reportes",tags=["Reportes"] )


def _exigir_personal(usuario_actual: Usuario | None) -> None:
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    if usuario_actual.rol not in ("Alimentador", "Administrador"):
        raise HTTPException(status_code=403, detail="Acceso sólo para personal autorizado")


def _exigir_administrador(usuario_actual: Usuario = Depends(get_current_user)) -> Usuario:
    _exigir_personal(usuario_actual)
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede modificar reportes")
    return usuario_actual


@router.get("/", response_model=list[ReporteListado])
def listar_reportes(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):

    return reporte_service.listar_reportes(
        db=db,
        id_usuario=usuario_actual.id_usuario if usuario_actual.rol is None else None,
    )


@router.get("/{id_reporte}", response_model=ReporteDetalle)
def obtener_reporte(
    id_reporte: int,
    request: Request,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    if usuario_actual.rol not in ("Alimentador", "Administrador"):
        raise HTTPException(status_code=403, detail="Acceso sólo para personal autorizado")

    detalle = reporte_service.obtener_detalle_reporte(db=db, id_reporte=id_reporte)
    if detalle.tiene_imagen:
        detalle.imagen = str(
            request.url_for("ver_imagen_reporte", id_reporte=id_reporte)
        )
        detalle.url_descarga_imagen = str(
            request.url_for("descargar_imagen_reporte", id_reporte=id_reporte)
        )
    return detalle


@router.patch(
    "/{id_reporte}",
    response_model=ReporteDetalle,
    dependencies=[Depends(_exigir_administrador)],
)
def actualizar_reporte(
    id_reporte: int,
    datos: ActualizarReporte,
    db: Session = Depends(get_db),
):
    return reporte_service.actualizar_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
    )


@router.get("/{id_reporte}/imagen", response_model=ImagenReporteResponse)
def obtener_imagen_reporte(
    id_reporte: int,
    response: Response,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    _exigir_personal(usuario_actual)

    resultado = reporte_service.obtener_urls_imagen_reporte(
        db=db, id_reporte=id_reporte
    )
    response.headers["Cache-Control"] = "no-store"
    return resultado


@router.get(
    "/{id_reporte}/imagen/ver",
    response_class=RedirectResponse,
    status_code=status.HTTP_302_FOUND,
)
def ver_imagen_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    _exigir_personal(usuario_actual)
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
)
def descargar_imagen_reporte(
    id_reporte: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    _exigir_personal(usuario_actual)
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
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede asociar reportes")

    return reporte_service.asociar_reporte_a_caso(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
    )
