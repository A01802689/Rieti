from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from app.schemas.municipio import MunicipioResponse
                                                                                                                                
#Solo sdorver ara vlaidar que cumla con los campos especificados
#los schemes es como una froma de validar laentrada y salida que usaremos en routes

class PermisoEnum(str, Enum):
    # Reportes
    reports_view = "reports.view"
    reports_view_detail = "reports.view_detail"
    reports_edit = "reports.edit"
    reports_close = "reports.close"
    # Casos
    cases_view = "cases.view"
    cases_edit = "cases.edit"
    cases_close = "cases.close"
    cases_assign = "cases.assign"
    # Herramientas
    map_view = "map.view"
    stats_view = "stats.view"
    logs_view = "logs.view"
    data_export = "data.export"
#el valor izqueurod es el que usare y el otro es el valor del enum

class RolEnum(str, Enum):
    administrador = "Administrador"
    alimentador = "Alimentador"

# no es necesario que se llamen igual que en al BD,
#los que se regisyren desde la app por esot no agregare municipio
class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    correo: str
    contrasena: str

#Ya la respuesta del usario cuando lo pida la bd ya debera generarle un id y el rol
# si el rol es de ciudadano entonces no deberia tener el id_municipio
#este mismo sirve como respuesta para admin
class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo: str
    rol: RolEnum | None = None
    id_municipio: int | None = None
    model_config = {"from_attributes": True}

class UsuarioLogin(BaseModel):
    correo: str
    contrasena: str

class UsuarioCreateAdmin(BaseModel):
    nombre: str
    apellido: str
    correo: str
    rol: RolEnum
    contrasena: str
    id_municipio: int


    # Lista del dashboard: hereda los 6 campos y agrega 3
class UsuarioDashboardResponse(UsuarioResponse):
    municipio: MunicipioResponse | None = None
    ultimo_acceso: datetime | None = None
    permisos: list[PermisoEnum] = []
    
class UsuarioCreateAdmin(BaseModel):
    nombre: str
    apellido: str
    correo: str
    rol: RolEnum
    contrasena: str
    id_municipio: int
    permisos: list[PermisoEnum] = []

class UsuarioPermisosUpdate(BaseModel):
    permisos: list[PermisoEnum]