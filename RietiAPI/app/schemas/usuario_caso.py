from pydantic import BaseModel

class UsuarioCasoCreate(BaseModel):
    """Asignación de un usuario a un caso"""
    id_usuario: int
    id_caso: int

class UsuarioCasoResponse(BaseModel):
    """Asignación de un usuario a un caso ya guardada"""
    id_usuario_caso: int
    id_usuario: int
    id_caso: int
    model_config = {"from_attributes": True}