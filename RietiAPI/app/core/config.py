from pydantic_settings import BaseSettings
#debe ser igual el nomrbe a los que declare en el env
class Settings(BaseSettings):
    """Configuración de la API leída de variables de entorno o del archivo .env

    Los nombres deben coincidir con los declarados en el .env

    Attributes:
        DB_HOST: servidor de PostgreSQL
        DB_PORT: puerto de PostgreSQL
        DB_USER: usuario de la base de datos
        DB_PASSWORD: contraseña de la base de datos
        DB_NAME: nombre de la base de datos
        SECRET_KEY: clave con la que se firman los tokens de sesión
        DASHBOARD_ORIGIN: origen del dashboard que permite CORS
        PRODUCTION: activa cookies seguras y SameSite none en producción
        AWS_REGION: región de AWS del bucket de imágenes
        S3_REPORTES_BUCKET: bucket de S3 donde se guardan las imágenes de reportes
        S3_PRESIGNED_URL_EXPIRES_IN: segundos de vigencia de las URL prefirmadas de S3
        SMTP_HOST: servidor SMTP para enviar correos
        SMTP_PORT: puerto del servidor SMTP
        SMTP_USER: usuario SMTP, vacío si el servidor no pide autenticación
        SMTP_PASSWORD: contraseña SMTP
        SMTP_FROM: dirección remitente de los correos
        SMTP_FROM_NAME: nombre del remitente de los correos
        SMTP_TIMEOUT: segundos de espera máxima al enviar un correo
        RECOVERY_CODE_EXPIRE_MINUTES: minutos de vigencia del código de recuperación
        RECOVERY_LINK_EXPIRE_MINUTES: minutos de vigencia del enlace de recuperación
        RECOVERY_MAX_ATTEMPTS: intentos permitidos al validar un código de recuperación
        DASHBOARD_URL: dirección completa del dashboard con su ruta base, por ejemplo https://a01802689.github.io/Rieti, para armar el enlace del correo, si está vacía se usa DASHBOARD_ORIGIN
        RECOVERY_SEND_IN_BACKGROUND: True envía el correo después de responder, lo normal en un servidor, False lo envía antes de responder, necesario en Lambda porque congela la función al terminar la respuesta y puede dejar el envío a medias, con False el correo existente tarda más en responder
    """
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    SECRET_KEY: str
    DASHBOARD_ORIGIN: str
    PRODUCTION: bool = False

    AWS_REGION: str
    S3_REPORTES_BUCKET: str
    S3_PRESIGNED_URL_EXPIRES_IN: int = 300

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_FROM_NAME: str = "Rieti"
    SMTP_TIMEOUT: int = 10

    RECOVERY_CODE_EXPIRE_MINUTES: int = 10
    RECOVERY_LINK_EXPIRE_MINUTES: int = 15
    RECOVERY_MAX_ATTEMPTS: int = 5
    DASHBOARD_URL: str = ""
    RECOVERY_SEND_IN_BACKGROUND: bool = True
    model_config = {"env_file": ".env"}

# Los campos obligatorios los lee de .env; Pylance no lo sabe y marcaría argumentos faltantes
settings = Settings()  # pyright: ignore[reportCallIssue]