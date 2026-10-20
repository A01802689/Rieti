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
    """Construye la respuesta de sesión con los permisos efectivos del usuario

    Args:
        usuario: usuario de la sesión

    Returns:
        Datos del usuario más su lista de permisos efectivos
    """
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
    """Crea una cuenta, es público con límite de 10 peticiones por minuto

    Sin sesión o con sesión de ciudadano crea un ciudadano e ignora rol, id_municipio y permisos
    Un administrador crea personal si envía rol y un ciudadano si no lo envía
    Un alimentador no puede crear usuarios

    Args:
        request: petición HTTP, la necesita el limitador de peticiones
        datos: datos de la cuenta nueva
        db: sesión de base de datos
        usuario_actual: usuario de la sesión, None si no hay sesión válida

    Returns:
        Usuario creado

    Raises:
        HTTPException: 403 si el usuario de la sesión es alimentador, 404 si el municipio no existe, 409 si el correo ya existe, 422 si falta el rol o el municipio para crear personal, 429 si se supera el límite
    """
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
    """Inicia sesión con correo y contraseña y guarda el token en la cookie access_token, es público con límite de 5 peticiones por minuto

    Args:
        request: petición HTTP, la necesita el limitador de peticiones
        datos: correo y contraseña
        response: respuesta HTTP en la que se fija la cookie
        db: sesión de base de datos

    Returns:
        Datos del usuario con sus permisos efectivos

    Raises:
        HTTPException: 401 si el correo o la contraseña son incorrectos, 429 si se supera el límite
    """
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
    """Cierra la sesión eliminando la cookie access_token, es público

    Args:
        response: respuesta HTTP de la que se elimina la cookie

    Returns:
        Mensaje de confirmación
    """
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=SesionResponse)
def obtener_sesion(usuario_actual: Usuario = Depends(get_current_user)):
    """Devuelve el usuario de la sesión con sus permisos efectivos, requiere sesión

    Args:
        usuario_actual: usuario de la sesión

    Returns:
        Datos del usuario con sus permisos efectivos

    Raises:
        HTTPException: 401 sin sesión válida
    """
    return _sesion(usuario_actual)




@router.post("/rol", response_model=UsuarioResponse, tags=["Dashboard - Usuarios"])
def crear_usuario_con_rol(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Crea un usuario del personal con rol y municipio, requiere rol Administrador

    Args:
        datos: datos de la cuenta con rol, municipio y permisos
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Usuario creado

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 404 si el municipio no existe, 409 si el correo ya existe
    """
    return usuario_service.create_usuario_admin(db, datos, usuario_actual.id_usuario)


@router.get(
    "",
    response_model=list[UsuarioDashboardResponse],
    tags=["Dashboard - Usuarios"],
    dependencies=[Depends(exigir_administrador)],
)
def listar_usuarios(db: Session = Depends(get_db)):
    """Lista todos los usuarios con su municipio y permisos guardados, requiere rol Administrador

    Args:
        db: sesión de base de datos

    Returns:
        Usuarios ordenados por apellido y nombre

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador
    """
    return usuario_service.get_usuarios(db)


@router.get(
    "/{id_usuario}",
    response_model=UsuarioDashboardResponse,
    tags=["Dashboard - Usuarios"],
    dependencies=[Depends(exigir_administrador)],
)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    """Obtiene un usuario con su municipio y permisos guardados, requiere rol Administrador

    Args:
        id_usuario: identificador del usuario
        db: sesión de base de datos

    Returns:
        Datos del usuario

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 404 si el usuario no existe
    """
    return usuario_service.get_usuario(db, id_usuario)


@router.delete("/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT, tags=["Dashboard - Usuarios"])
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Elimina un usuario junto con sus seguimientos, asignaciones y logs, requiere rol Administrador

    Sus reportes se conservan sin usuario asociado

    Args:
        id_usuario: identificador del usuario a eliminar
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Raises:
        HTTPException: 401 sin sesión, 403 si no es administrador, 404 si el usuario no existe, 409 si intenta eliminarse a sí mismo
    """
    usuario_service.delete_usuario(db, id_usuario, usuario_actual.id_usuario)


@router.put("/{id_usuario}/permisos", response_model=UsuarioDashboardResponse)
def actualizar_permisos(
    id_usuario: int,
    datos: UsuarioPermisosUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(exigir_administrador),
):
    """Reemplaza los permisos de un alimentador, requiere rol Administrador

    Args:
        id_usuario: identificador del alimentador
        datos: lista nueva de permisos
        db: sesión de base de datos
        usuario_actual: usuario de la sesión

    Returns:
        Datos del usuario con sus permisos actualizados

    Raises:
        HTTPException: 400 si el usuario es ciudadano o administrador, 401 sin sesión, 403 si no es administrador, 404 si el usuario no existe
    """
    return usuario_service.update_permisos(db, id_usuario, datos, usuario_actual.id_usuario)