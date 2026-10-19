from typing import Literal

from pydantic import BaseModel, Field

# Los schemas solo validan lo que entra y sale de las rutas (routes/recovery.py).
# Si algo no cumple, FastAPI responde 422 automáticamente sin llegar al servicio.

# Correo con forma válida (algo@dominio.ext). No usa EmailStr porque necesita el paquete email-validator, que no está en requirements.txt.
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RecoveryRequest(BaseModel):
    email: str = Field(max_length=100, pattern=EMAIL_PATTERN)
    method: Literal["code", "link"]  # "code": código de 6 dígitos, "link": enlace


class CodeReset(BaseModel):
    email: str = Field(max_length=100, pattern=EMAIL_PATTERN)
    code: str = Field(pattern=r"^\d{6}$")
    # 72: bcrypt solo usa los primeros 72 caracteres de una contraseña.
    new_password: str = Field(min_length=8, max_length=72)


class LinkReset(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=8, max_length=72)


class MessageResponse(BaseModel):
    message: str
