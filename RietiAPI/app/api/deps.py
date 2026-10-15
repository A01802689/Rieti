from app.db.session import SessionLocal
from fastapi import Request, HTTPException, Depends
from app.core.security import verify_token
from sqlalchemy.orm import Session
from app.repositories import usuario_repository



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        
def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if token is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=401, detail="Token inválido")
    id_usuario = int(sub)
    usuario = usuario_repository.get_by_id(db, id_usuario)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario

