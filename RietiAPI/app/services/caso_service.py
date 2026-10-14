from fastapi import HTTPException, status
from geoalchemy2.elements import WKTElement
from sqlalchemy.orm import Session

from app.models.caso import Caso, Estado
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.schemas.caso import AbrirCasoDesdeReporte, CasoAbiertoResponse


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
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise
