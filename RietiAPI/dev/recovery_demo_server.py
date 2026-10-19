"""Servidor de DEMOSTRACIÓN de la recuperación de contraseña. No usa la base de datos real.

Sirve solo las rutas /password-recovery/* con una base SQLite en memoria y un único usuario de mentira, para
probar el dashboard y los correos (con Mailpit) sin tocar RDS ni crear ninguna tabla. Todo se pierde al apagarlo.

Uso (desde RietiAPI/):
    mailpit                                    # en otra terminal; los correos se ven en http://localhost:8025
    .venv/bin/python dev/recovery_demo_server.py
y en el dashboard, VITE_API_URL=http://localhost:8000 (reinicia `npm run dev` después de cambiarlo).

Usuario de prueba: ana@mail.com (o el de DEMO_EMAIL), contraseña inicial "old-password".
Para comprobar que la contraseña cambió: POST /demo/check-password {"password": "..."} -> {"matches": true|false}
"""
import os
import sys
import types
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # para poder importar `app` desde dev/

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402
from slowapi import _rate_limit_exceeded_handler  # noqa: E402
from slowapi.errors import RateLimitExceeded  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.api.deps import get_db  # noqa: E402
from app.api.routes import recovery as recovery_routes  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.core.limiter import limiter  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.models import municipio, password_reset, usuario  # noqa: E402, F401
from app.models.password_reset import PasswordReset  # noqa: E402
from app.repositories import usuario_repository  # noqa: E402
from app.services.usuario_service import pwd_context  # noqa: E402

# Con SMTP real (Gmail) el correo SE ENVÍA de verdad a esta dirección: pon la tuya con DEMO_EMAIL=tucorreo@gmail.com
DEMO_EMAIL = os.environ.get("DEMO_EMAIL", "ana@mail.com").lower()
DEMO_PASSWORD = "old-password"

# Base de datos falsa: SQLite en memoria con solo la tabla password_reset.
engine = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
Base.metadata.create_all(engine, tables=[PasswordReset.__table__])
Session = sessionmaker(bind=engine)

# Usuario de mentira: el servicio lo busca con usuario_repository, que aquí se reemplaza.
user = types.SimpleNamespace(id_usuario=1, correo=DEMO_EMAIL, contrasena_hash=pwd_context.hash(DEMO_PASSWORD))
usuario_repository.get_by_email = lambda db, email: user if email.lower() == DEMO_EMAIL else None
usuario_repository.get_by_id = lambda db, id_usuario: user if id_usuario == user.id_usuario else None
usuario_repository.update = lambda db, u: u


def get_demo_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


class PasswordCheck(BaseModel):
    password: str


app = FastAPI(title="Rieti API - demo de recuperación (sin base de datos real)")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.DASHBOARD_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.dependency_overrides[get_db] = get_demo_db
app.include_router(recovery_routes.router)


@app.post("/demo/check-password")
def check_password(data: PasswordCheck):
    return {"matches": pwd_context.verify(data.password, user.contrasena_hash)}


if __name__ == "__main__":
    print(f"Demo sin base de datos real. Usuario: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    print(f"SMTP: {settings.SMTP_HOST}:{settings.SMTP_PORT} (Mailpit: http://localhost:8025)")
    print(f"CORS permitido para: {settings.DASHBOARD_ORIGIN}")
    uvicorn.run(app, host="127.0.0.1", port=8000)
