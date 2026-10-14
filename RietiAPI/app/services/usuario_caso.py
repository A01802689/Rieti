
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.usuario_caso import UsuarioCaso
from app.schemas.usuario_caso import UsuarioCasoCreate

from app.repositories import usuario_repository as usuario_repo
from app.repositories import caso_repository as caso_repo
from app.repositories import usuario_caso_repository as usuario_caso_repo

def create_usuario_caso(db: Session, data: UsuarioCasoCreate) -> UsuarioCaso:
    usuario = usuario_repo.get_by_id(db, data.id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario.rol is None:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden asignar Administradores o Alimentadores",
        )

    caso = caso_repo.get_by_id(db, data.id_caso)
    if caso is None:
        raise HTTPException(status_code=404, detail="Caso no encontrado")

    existente = usuario_caso_repo.get_by_usuario_y_caso(db, data.id_usuario, data.id_caso)
    if existente is not None:
        raise HTTPException(
            status_code=409,
            detail="El usuario ya está asignado a este caso",
        )

    nuevo = UsuarioCaso(
        id_usuario=data.id_usuario,
        id_caso=data.id_caso,
    )
    return usuario_caso_repo.create_usuario_caso(db, nuevo)


