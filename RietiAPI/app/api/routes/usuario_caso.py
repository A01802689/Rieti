from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.usuario_caso import UsuarioCasoCreate, UsuarioCasoResponse
from app.services import usuario_caso as usuario_caso_service

router = APIRouter(prefix="/usuario-caso", tags=["UsuarioCaso"])

@router.post("", response_model=UsuarioCasoResponse, status_code=201)
def asignar_caso(
    data: UsuarioCasoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Asigna un usuario del personal a un caso, requiere rol Administrador

    Esta ruta no está registrada en main, por lo que hoy no se expone

    Args:
        data: usuario y caso a vincular
        db: sesión de base de datos
        current_user: usuario de la sesión

    Returns:
        Asignación creada

    Raises:
        HTTPException: 400 si el usuario no es personal, 401 sin sesión, 403 si no es administrador, 404 si el usuario o el caso no existen, 409 si ya está asignado
    """

    # podrian ser alimnetadors mabin falta por confirmar    
    if current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo el Administrador puede asignar casos")
    return usuario_caso_service.create_usuario_caso(db, data)