from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.services import usuario_service
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioLogin
from fastapi import APIRouter, Depends, HTTPException
router = APIRouter()

@router.post("/usuarios", response_model=UsuarioResponse)

def crear_usuario(datos: UsuarioCreate, db: Session = Depends(get_db)):
    return usuario_service.create_usuario(db, datos)


#este lo genere solo par ausarios los admins lo hare en otro .py
@router.post("/usuarios/login", response_model=UsuarioResponse)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = usuario_service.login(db, datos.correo, datos.contrasena)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return usuario


