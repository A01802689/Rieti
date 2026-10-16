from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.services import usuario_service
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioLogin,
    UsuarioCreateAdmin,
    UsuarioDashboardResponse,
    UsuarioPermisosUpdate
)
from app.models.usuario import Usuario
from app.core.security import create_access_token, settings
from app.core.limiter import limiter

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("", response_model=UsuarioResponse)
@limiter.limit("10/minute")
def crear_usuario(request: Request, datos: UsuarioCreate, db: Session = Depends(get_db)):
    return usuario_service.create_usuario(db, datos)


@router.post("/login", response_model=UsuarioResponse)
@limiter.limit("5/minute")
def login(request: Request, datos: UsuarioLogin, response: Response, db: Session = Depends(get_db)):
    usuario = usuario_service.login(db, datos.correo, datos.contrasena)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    token = create_access_token({"sub": str(usuario.id_usuario), "rol": usuario.rol})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.PRODUCTION,
        samesite="none" if settings.PRODUCTION else "lax",
    )
    return usuario


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UsuarioResponse)
def obtener_sesion(usuario_actual: Usuario = Depends(get_current_user)):
    return usuario_actual




@router.post("/rol", response_model=UsuarioResponse, tags=["Dashboard - Usuarios"])
def crear_usuario_con_rol(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo un Administrador puede crear nuevos Administradores o Alimentadores")
    return usuario_service.create_usuario_admin(db, datos)


@router.get("/dashboard", response_model=list[UsuarioDashboardResponse], tags=["Dashboard - Usuarios"])
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo un Administrador puede ver los usuarios")
    return usuario_service.get_usuarios(db)


@router.put("/{id_usuario}/permisos", response_model=UsuarioDashboardResponse, tags=["Usuarios"])
def actualizar_permisos(
    id_usuario: int,
    datos: UsuarioPermisosUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    if usuario_actual.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo un Administrador puede cambiar permisos")
    return usuario_service.update_permisos(db, id_usuario, datos)