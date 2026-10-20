from datetime import datetime
from app.schemas.fechas import FechaUTC
from enum import Enum
from pydantic import BaseModel, field_validator
from app.schemas.municipio import MunicipioResponse
                                                                                                                                
#Solo sdorver ara vlaidar que cumla con los campos especificados
#los schemes es como una froma de validar laentrada y salida que usaremos en routes

class PermisoEnum(str, Enum):
    """Claves de permiso del panel

    El valor de texto es el que se guarda en la base y viaja en el dashboard
    """
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
#el valor izqueurod es el que usare y el otro es el valor del enum

class RolEnum(str, Enum):
    """Roles del personal del panel"""
    administrador = "Administrador"
    alimentador = "Alimentador"

# no es necesario que se llamen igual que en al BD,
#los que se regisyren desde la app por esot no agregare municipio
class UsuarioCreate(BaseModel):
    """Alta de usuario

    Un registro público solo usa nombre, apellido, correo y contraseña; rol, municipio y permisos solo cuentan si quien da de alta es Administrador

    Attributes:
        contrasena: contraseña en texto plano
        rol: None para registrar un ciudadano
    """
    nombre: str
    apellido: str
    correo: str
    contrasena: str
    rol: RolEnum | None = None
    id_municipio: int | None = None
    permisos: list[PermisoEnum] = []

#Ya la respuesta del usario cuando lo pida la bd ya debera generarle un id y el rol
# si el rol es de ciudadano entonces no deberia tener el id_municipio
#este mismo sirve como respuesta para admin
class UsuarioResponse(BaseModel):
    """Datos públicos de un usuario

    Attributes:
        rol: None para ciudadanos
        id_municipio: None para ciudadanos
    """
    id_usuario: int
    nombre: str
    apellido: str
    correo: str
    rol: RolEnum | None = None
    id_municipio: int | None = None
    model_config = {"from_attributes": True}

class SesionResponse(UsuarioResponse):
    """Usuario de la sesión con sus permisos efectivos

    Attributes:
        permisos: claves vigentes en el orden de PermisoEnum, todas las del Administrador y ninguna para ciudadanos
    """
    permisos: list[PermisoEnum] = []

class UsuarioLogin(BaseModel):
    """Credenciales de inicio de sesión"""
    correo: str
    contrasena: str

    # Lista del dashboard: hereda los 6 campos y agrega 3
class UsuarioDashboardResponse(UsuarioResponse):
    """Usuario tal como lo lista el panel de administración

    Attributes:
        ultimo_acceso: último inicio de sesión en UTC sin zona horaria
        permisos: claves guardadas, vacío para Administradores aunque tengan todos los permisos
    """
    municipio: MunicipioResponse | None = None
    ultimo_acceso: FechaUTC | None = None
    permisos: list[PermisoEnum] = []

    @field_validator("permisos", mode="before")
    @classmethod
    def descartar_permisos_desconocidos(cls, valor):
        """Descarta las claves guardadas que ya no existen en PermisoEnum

        Args:
            valor: permisos guardados, posiblemente None

        Returns:
            La lista de claves válidas
        """
        validos = {permiso.value for permiso in PermisoEnum}
        return [
            permiso for permiso in (valor or [])
            if getattr(permiso, "value", permiso) in validos
        ]

class UsuarioCreateAdmin(BaseModel):
    """Alta de personal por un Administrador, con rol y municipio obligatorios"""
    nombre: str
    apellido: str
    correo: str
    rol: RolEnum
    contrasena: str
    id_municipio: int
    permisos: list[PermisoEnum] = []

class UsuarioPermisosUpdate(BaseModel):
    """Lista completa de permisos nueva de un Alimentador"""
    permisos: list[PermisoEnum]