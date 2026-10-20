from typing import Literal

from pydantic import BaseModel


class ImagenUploadUrlRequest(BaseModel):
    """Solicitud de URL de subida de imagen"""
    content_type: Literal["image/jpeg", "image/png"]


class ImagenUploadUrlResponse(BaseModel):
    """URL de subida de imagen

    Attributes:
        imagen_key: clave del objeto en S3
        upload_url: URL prefirmada para subir con PUT
        expires_in: segundos de vigencia de la URL
    """
    imagen_key: str
    upload_url: str
    expires_in: int