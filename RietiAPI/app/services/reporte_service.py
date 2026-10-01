from sqlalchemy.orm import Session

from app.models.reporte import Reporte
from app.schemas.reporte import ReporteCreate
from app.repositories import reporte_repositorio

def create_reporte(db: Session, datos: ReporteCreate):
    nuevo_reporte = Reporte(
        id_usuario=datos.id_usuario,
        id_ubicacion=datos.id_ubicacion,
        folio_reporte=datos.folio_reporte,
        cantidad_nna=datos.cantidad_nna,
        edad_aproximada=datos.edad_aproximada,
        tipo_trabajo=datos.tipo_trabajo,
        descripcion=datos.descripcion,
        imagen=datos.imagen,
    )
    return reporte_repositorio.create(db, nuevo_reporte)