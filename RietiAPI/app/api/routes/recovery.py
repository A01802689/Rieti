from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.core.limiter import limiter
from app.schemas.recovery import CodeReset, LinkReset, MessageResponse, RecoveryRequest
from app.services import recovery_service

router = APIRouter(prefix="/password-recovery", tags=["Password recovery"])

REQUEST_MESSAGE = "Si el correo está registrado, enviamos las instrucciones para recuperar la contraseña."

@router.post("/request", response_model=MessageResponse, status_code=202)
@limiter.limit("5/minute")
def request_recovery(
    request: Request,  # slowapi lo necesita para saber la IP
    data: RecoveryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    send = recovery_service.request_recovery(db, email=data.email, method=data.method)
    if send is not None:
        if settings.RECOVERY_SEND_IN_BACKGROUND:
            background_tasks.add_task(send)
        else:
            # En Lambda: si se mandara después de responder, la función se congelaría con el envío a medias.
            # send() no lanza errores (el servicio los registra), así que la respuesta sigue siendo la misma.
            send()
    return {"message": REQUEST_MESSAGE}


@router.post("/reset/code", response_model=MessageResponse)
@limiter.limit("10/minute")
def reset_with_code(request: Request, data: CodeReset, db: Session = Depends(get_db)):
    try:
        recovery_service.reset_with_code(db, email=data.email, code=data.code, new_password=data.new_password)
    except recovery_service.InvalidRecovery:
        raise HTTPException(status_code=400, detail="Código inválido o vencido")
    return {"message": "Contraseña actualizada"}

@router.post("/reset/link", response_model=MessageResponse)
@limiter.limit("10/minute")
def reset_with_link(request: Request, data: LinkReset, db: Session = Depends(get_db)):
    try:
        recovery_service.reset_with_link(db, token=data.token, new_password=data.new_password)
    except recovery_service.InvalidRecovery:
        raise HTTPException(status_code=400, detail="Enlace inválido o vencido")
    return {"message": "Contraseña actualizada"}
