from sqlalchemy.orm import Session
from app.models.usuario_caso import UsuarioCaso

def create_usuario_caso(db: Session, usuario_caso: UsuarioCaso) -> UsuarioCaso:
    db.add(usuario_caso)
    db.commit()
    db.refresh(usuario_caso)
    return usuario_caso

def get_by_id(db: Session, id_usuario_caso: int) -> UsuarioCaso | None:
    return db.get(UsuarioCaso, id_usuario_caso)


