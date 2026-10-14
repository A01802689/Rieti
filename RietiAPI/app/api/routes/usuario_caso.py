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

    # podrian ser alimnetadors mabin falta por confirmar    
    if current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo el Administrador puede asignar casos")
    return usuario_caso_service.create_usuario_caso(db, data)