from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.caso import AbrirCasoDesdeReporte, CasoAbiertoResponse
from app.schemas.caso import (
    ActualizarCantidadNna, ActualizarEdadAproximada, ActualizarTipoTrabajo,
    CantidadNnaCasoResponse, EdadAproximadaCasoResponse, TipoTrabajoCasoResponse,
    CasoListado, CasoDetalle,
)
from app.services import caso_service

router = APIRouter(prefix="/reportes", tags=["Casos"])
casos_router = APIRouter(prefix="/casos", tags=["Casos"])


def exigir_personal(usuario: Usuario = Depends(get_current_user)):
    if usuario is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    if usuario.rol not in ("Alimentador", "Administrador"):
        raise HTTPException(status_code=403, detail="Acceso sólo para personal autorizado")
    return usuario


def exigir_administrador(usuario: Usuario = Depends(exigir_personal)):
    if usuario.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede modificar estos datos")
    return usuario


@casos_router.get("", response_model=list[CasoListado], dependencies=[Depends(exigir_personal)])
def listar_casos(db: Session = Depends(get_db)):
    return caso_service.listar_casos(db=db)


@casos_router.get("/{id_caso}", response_model=CasoDetalle, dependencies=[Depends(exigir_personal)])
def obtener_caso(id_caso: int, db: Session = Depends(get_db)):
    return caso_service.obtener_caso(db=db, id_caso=id_caso)


@casos_router.patch("/{id_caso}/cantidad-nna", response_model=CantidadNnaCasoResponse,
                    dependencies=[Depends(exigir_administrador)])
def actualizar_cantidad_nna(id_caso: int, datos: ActualizarCantidadNna, db: Session = Depends(get_db)):
    return caso_service.actualizar_dato_caso(db=db, id_caso=id_caso, datos=datos)


@casos_router.patch("/{id_caso}/edad-aproximada", response_model=EdadAproximadaCasoResponse,
                    dependencies=[Depends(exigir_administrador)])
def actualizar_edad_aproximada(id_caso: int, datos: ActualizarEdadAproximada, db: Session = Depends(get_db)):
    return caso_service.actualizar_dato_caso(db=db, id_caso=id_caso, datos=datos)


@casos_router.patch("/{id_caso}/tipo-trabajo", response_model=TipoTrabajoCasoResponse,
                    dependencies=[Depends(exigir_administrador)])
def actualizar_tipo_trabajo(id_caso: int, datos: ActualizarTipoTrabajo, db: Session = Depends(get_db)):
    return caso_service.actualizar_dato_caso(db=db, id_caso=id_caso, datos=datos)


@router.post(
    "/{id_reporte}/abrir-caso",
    response_model=CasoAbiertoResponse,
    status_code=status.HTTP_201_CREATED,
)
def abrir_caso(
    id_reporte: int,
    datos: AbrirCasoDesdeReporte,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Sólo un administrador puede abrir casos")

    return caso_service.abrir_caso_desde_reporte(
        db=db,
        id_reporte=id_reporte,
        datos=datos,
    )
