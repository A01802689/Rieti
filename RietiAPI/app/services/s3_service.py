import boto3

from app.core.config import settings

def obtener_cliente_s3():
    return boto3.client(
        "s3",
        region_name = settings.AWS_REGION)


def eliminar_imagen(*, imagen_key: str) -> None:
    obtener_cliente_s3().delete_object(
        Bucket=settings.S3_REPORTES_BUCKET,
        Key=imagen_key,
    )


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


def generar_urls_lectura(*, imagen_key: str, id_reporte: int) -> tuple[str, str]:
    cliente = obtener_cliente_s3()
    metadata = cliente.head_object(
        Bucket=settings.S3_REPORTES_BUCKET,
        Key=imagen_key,
    )
    content_type = metadata.get("ContentType")
    extension = {"image/jpeg": "jpg", "image/png": "png"}.get(content_type)
    if extension is None:
        raise ValueError("La imagen tiene un tipo de contenido no admitido")

    parametros = {
        "Bucket": settings.S3_REPORTES_BUCKET,
        "Key": imagen_key,
        "ResponseContentType": content_type,
        "ResponseCacheControl": "no-store",
    }
    url_visualizacion = cliente.generate_presigned_url(
        ClientMethod="get_object",
        Params={**parametros, "ResponseContentDisposition": "inline"},
        ExpiresIn=settings.S3_PRESIGNED_URL_EXPIRES_IN,
        HttpMethod="GET",
    )
    url_descarga = cliente.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            **parametros,
            "ResponseContentDisposition": (
                f'attachment; filename="reporte-{id_reporte}.{extension}"'
            ),
        },
        ExpiresIn=settings.S3_PRESIGNED_URL_EXPIRES_IN,
        HttpMethod="GET",
    )
    return url_visualizacion, url_descarga
