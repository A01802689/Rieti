from sqlalchemy.orm import Session
from app.models.folio_contador import FolioContador

def obtener_siguiente_consecutivo(db:Session, id_municipio: int, anio: int) -> int:
    contador = (
        db.query(FolioContador)
        .filter(
            FolioContador.id_municipio == id_municipio,
            FolioContador.anio == anio
        )
        .with_for_update()
        .first()
    )

    if contador is None:
        contador = FolioContador(
            id_municipio=id_municipio,
            anio=anio,
            ultimo_consecutivo=1,
        )
        db.add(contador)
        db.flush()
        return contador.ultimo_consecutivo

    contador.ultimo_consecutivo += 1
    db.flush()
    return contador.ultimo_consecutivo
