""" from fastapi import APIRouter, Depends, HTTPException, Response
#la razon de  Response es modifciar la respuesta http directamente y agregrarle una cookioe
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.usuario import UsuarioLogin, UsuarioResponse
from app.services import usuario_service
from app.core.security import create_access_token


from app.api.deps import get_db, get_current_user
from app.schemas.usuario import UsuarioLogin, UsuarioResponse, UsuarioCreateAdmin
from app.models.usuario import Usuario
router = APIRouter()

# esta ya es una ruta exclusiva del admin en la pagina web
@router.post("/admin/login", response_model=UsuarioResponse)
def login_admin(datos: UsuarioLogin, response: Response, db: Session = Depends(get_db)):
    usuario = usuario_service.login(db, datos.correo, datos.contrasena)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    if usuario.rol is None:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este panel")
    token = create_access_token({"sub": str(usuario.id_usuario), "rol": usuario.rol})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return usuario



# solo aun amdin podra crear otros admin 
@router.post("/usuarios/admin", response_model=UsuarioResponse)
def crear_usuario_admin(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user)
):
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo un Administrador puede crear nuevos Administradores o Alimentadores")
    return usuario_service.create_usuario_admin(db, datos) """