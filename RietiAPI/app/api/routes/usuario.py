from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.services import usuario_service
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioLogin, UsuarioCreateAdmin
from app.models.usuario import Usuario
from app.core.security import create_access_token

router = APIRouter()

@router.post("/usuarios", response_model=UsuarioResponse)
def crear_usuario(datos: UsuarioCreate, db: Session = Depends(get_db)):
    return usuario_service.create_usuario(db, datos)


#este lo genere solo par ausarios los admins lo hare en otro .py
@router.post("/usuarios/login", response_model=UsuarioResponse)
def login(datos: UsuarioLogin,response: Response ,db: Session = Depends(get_db)):
    usuario = usuario_service.login(db, datos.correo, datos.contrasena)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    token = create_access_token({"sub": str(usuario.id_usuario), "rol": usuario.rol})
    response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax"
        )
    return usuario


@router.post("/usuarios/admin", response_model=UsuarioResponse)
def crear_usuario_admin(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo un Administrador puede crear nuevos Administradores o Alimentadores")
    return usuario_service.create_usuario_admin(db, datos)