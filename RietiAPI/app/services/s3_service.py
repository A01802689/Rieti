import boto3

from app.core.config import settings

def obtener_cliente_s3():
    return boto3.client(
        "s3",
        region_name = settings.AWS_REGION)

def generar_url_subida(*, imagen_key: str, content_type: str) -> str:
    return obtener_cliente_s3().generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.S3_REPORTES_BUCKET,
            "Key": imagen_key,
            "ContentType": content_type,
        },
        ExpiresIn = settings.S3_PRESIGNED_URL_EXPIRES_IN,
        HttpMethod = "PUT",

    )