from fastapi import HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.models.caso import Caso, Estado
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.schemas.caso import AbrirCasoDesdeReporte, CasoAbiertoResponse
from app.schemas.caso import (
    ActualizarCantidadNna, ActualizarEdadAproximada, ActualizarTipoTrabajo,
    CasoListado, CasoDetalle, MunicipioCasoResponse, UbicacionCasoResponse,
)
from app.schemas.seguimiento import SeguimientoResponse
from app.repositories import caso_repository


def abrir_caso_desde_reporte(
    *,
    db: Session,
    id_reporte: int,
    datos: AbrirCasoDesdeReporte,
) -> CasoAbiertoResponse:
    try:
        reporte = (
            db.query(Reporte)
            .filter(Reporte.id_reporte == id_reporte)
            .with_for_update()
            .first()
        )
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

        municipio = (
            db.query(Municipio)
            .filter(Municipio.id_municipio == datos.id_municipio)
            .first()
        )
        if municipio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El municipio no existe",
            )

        ubicacion = Ubicacion(
            id_municipio=municipio.id_municipio,
            colonia=datos.ubicacion.colonia,
            calle=datos.ubicacion.calle,
            coordenadas=WKTElement(
                f"POINT({datos.ubicacion.longitud} {datos.ubicacion.latitud})",
                srid=4326,
            ),
            referencia=datos.ubicacion.referencia,
        )
        db.add(ubicacion)
        db.flush()

        caso = Caso(
            id_municipio=municipio.id_municipio,
            id_ubicacion=ubicacion.id_ubicacion,
            estado=Estado.ABIERTO,
            urgencia=datos.urgencia,
        )
        db.add(caso)
        db.flush()

        reporte.id_caso = caso.id_caso

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
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise


def _datos_publicos(fila):
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
        tipo_trabajo=caso.tipo_trabajo,
    )


def listar_casos(*, db: Session) -> list[CasoListado]:
    return [CasoListado(**_datos_publicos(fila)) for fila in caso_repository.listar(db)]


def obtener_caso(*, db: Session, id_caso: int) -> CasoDetalle:
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


def actualizar_dato_caso(
    *, db: Session, id_caso: int,
    datos: ActualizarCantidadNna | ActualizarEdadAproximada | ActualizarTipoTrabajo,
):
    try:
        caso = caso_repository.obtener_para_actualizar(db, id_caso)
        if caso is None:
            raise HTTPException(status_code=404, detail="El caso no existe")
        valores = datos.model_dump()
        for campo, valor in valores.items():
            setattr(caso, campo, str(valor) if type(valor) is int else valor)
        respuesta = {"id_caso": caso.id_caso, **valores}
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise
