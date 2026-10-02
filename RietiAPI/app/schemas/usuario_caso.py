from pydantic import BaseModel

class UsuarioCasoResponse(BaseModel):
    id_usuario_caso: int
    id_usuario: int
    id_caso:int
    model_config = {"from_attributes": True}

