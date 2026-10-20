from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.seguimiento import Seguimiento
from app.repositories import seguimiento_repository, usuario_repository
from app.schemas.seguimiento import SeguimientoCreate, SeguimientoResponse


def crear_seguimiento(
    *,
    db: Session,
    id_caso: int,
    datos: SeguimientoCreate,
    id_usuario_actual: int,
) -> SeguimientoResponse:
    """Agrega una nota de seguimiento a un caso

    Bloquea la fila del caso para que el consecutivo y el folio no se repitan

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso
        datos: tipo y texto de la nota
        id_usuario_actual: identificador del autor

    Returns:
        La nota creada con su folio y el nombre del autor

    Raises:
        HTTPException: 422 si la nota queda vacía
        HTTPException: 401 si el autor ya no existe
        HTTPException: 404 si el caso no existe
    """
    nota = datos.nota.strip()
    if not nota:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La nota no puede estar vacía",
        )

    try:
        autor = usuario_repository.get_by_id(db, id_usuario_actual)
        if autor is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no autenticado",
            )

        caso = seguimiento_repository.obtener_caso_para_seguimiento(db, id_caso)
        if caso is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El caso no existe",
            )

        consecutivo = seguimiento_repository.obtener_siguiente_consecutivo(
            db, id_caso
        )
        nuevo_seguimiento = Seguimiento(
            id_caso=id_caso,
            id_usuario_autor=id_usuario_actual,
            consecutivo=consecutivo,
            folio=f"SEG-{caso.fecha_caso.year}-{id_caso:04d}-{consecutivo:02d}",
            tipo=datos.tipo.value,
            nota=nota,
        )
        db.add(nuevo_seguimiento)
        db.flush()
        db.refresh(nuevo_seguimiento)

        respuesta = SeguimientoResponse(
            folio=nuevo_seguimiento.folio,
            fecha=nuevo_seguimiento.fecha,
            tipo=nuevo_seguimiento.tipo,
            autor=f"{autor.nombre} {autor.apellido}".strip(),
            nota=nuevo_seguimiento.nota,
        )
        db.commit()
        return respuesta
    except Exception:
        db.rollback()
        raise
