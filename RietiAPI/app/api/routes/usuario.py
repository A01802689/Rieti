from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session

from app.api.deps import (
    exigir_administrador,
    get_current_user,
    get_current_user_opcional,
    get_db,
    permisos_efectivos,
)
from app.services import usuario_service
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioResponse,
    SesionResponse,
    UsuarioLogin,
    UsuarioCreateAdmin,
    UsuarioDashboardResponse,
    UsuarioPermisosUpdate
)
from app.models.usuario import Usuario
from app.core.security import create_access_token, settings
from app.core.limiter import limiter

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def _sesion(usuario: Usuario) -> SesionResponse:
    return SesionResponse(
        **UsuarioResponse.model_validate(usuario).model_dump(),
        permisos=permisos_efectivos(usuario),
    )


@router.post("", response_model=UsuarioResponse)
@limiter.limit("10/minute")
def crear_usuario(
    request: Request,
    datos: UsuarioCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario | None = Depends(get_current_user_opcional),
):
    if usuario_actual is not None and usuario_actual.rol == "Alimentador":
        raise HTTPException(status_code=403, detail="Un alimentador no puede crear usuarios")
    if usuario_actual is not None and usuario_actual.rol == "Administrador":
        if datos.rol is not None:
            return usuario_service.create_usuario_admin(db, datos, usuario_actual.id_usuario)
        return usuario_service.create_usuario(db, datos, usuario_actual.id_usuario)
    return usuario_service.create_usuario(db, datos)


@router.post("/login", response_model=SesionResponse)
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
    return _sesion(usuario)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=SesionResponse)
def obtener_sesion(usuario_actual: Usuario = Depends(get_current_user)):
    return _sesion(usuario_actual)




@router.post("/rol", response_model=UsuarioResponse, tags=["Dashboard - Usuarios"])
def crear_usuario_con_rol(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    return usuario_service.create_usuario_admin(db, datos, usuario_actual.id_usuario)


@router.get(
    "",
    response_model=list[UsuarioDashboardResponse],
    tags=["Dashboard - Usuarios"],
    dependencies=[Depends(exigir_administrador)],
)
def listar_usuarios(db: Session = Depends(get_db)):
    return usuario_service.get_usuarios(db)


@router.get(
    "/{id_usuario}",
    response_model=UsuarioDashboardResponse,
    tags=["Dashboard - Usuarios"],
    dependencies=[Depends(exigir_administrador)],
)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    return usuario_service.get_usuario(db, id_usuario)


@router.delete("/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT, tags=["Dashboard - Usuarios"])
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    usuario_service.delete_usuario(db, id_usuario, usuario_actual.id_usuario)


@router.put("/{id_usuario}/permisos", response_model=UsuarioDashboardResponse)
def actualizar_permisos(
    id_usuario: int,
    datos: UsuarioPermisosUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    return usuario_service.update_permisos(db, id_usuario, datos, usuario_actual.id_usuario)