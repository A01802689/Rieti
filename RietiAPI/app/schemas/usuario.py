from pydantic import BaseModel
from enum import Enum

#los schemes es como una froma de validar laentrada y salida que usaremos en routes

#el valor izqueurod es el que usare y el otro es el valor del enum

class RolEnum(str, Enum):
    administrador = "Administrador"
    alimentador = "Alimentador"
    ciudadano = "Ciudadano"

# no es necesario que se llamen igual que en al BD,
#los que se regisyren desde la app por esot no agregare municipio
class UsuarioCreate(BaseModel):
    nombre: str
    correo: str
    contrasena: str

#Ya la respuesta del usario cuando lo pida la bd ya debera generarle un id y el rol
# si el rol es de ciudadano entonces no deberia tener el id_municipio
class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre: str
    correo: str
    rol: RolEnum
    id_municipio: int | None = None
    model_config = {"from_attributes": True}

class UsuarioLogin(BaseModel):
    correo: str
    contrasena: str