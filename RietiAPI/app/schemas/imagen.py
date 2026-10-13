from typing import Literal

from pydantic import BaseModel


class ImagenUploadUrlRequest(BaseModel):
    content_type: Literal["image/jpeg", "image/png"]


class ImagenUploadUrlResponse(BaseModel):
    imagen_key: str
    upload_url: str
    expires_in: int