from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.services import usuario_service
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioLogin, UsuarioCreateAdmin
from app.models.usuario import Usuario
from app.core.security import create_access_token, settings
from app.core.limiter import limiter


router = APIRouter()


@router.post("/usuarios/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada"}



@router.post("/usuarios", response_model=UsuarioResponse)
@limiter.limit("10/minute")
def crear_usuario(request: Request, datos: UsuarioCreate, db: Session = Depends(get_db)):
    return usuario_service.create_usuario(db, datos)


#este lo genere solo par ausarios los admins lo hare en otro .py
@router.post("/usuarios/login", response_model=UsuarioResponse)
@limiter.limit("5/minute")
def login(request: Request, datos: UsuarioLogin,response: Response ,db: Session = Depends(get_db)):
    usuario = usuario_service.login(db, datos.correo, datos.contrasena)
    samesite = "lax" if not settings.PRODUCTION else "none"
    secure = False if not settings.PRODUCTION else True
    if usuario is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    token = create_access_token({"sub": str(usuario.id_usuario), "rol": usuario.rol})
    response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=secure,
            samesite=samesite
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