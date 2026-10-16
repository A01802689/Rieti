from pydantic_settings import BaseSettings
#debe ser igual el nomrbe a los que declare en el env
class Settings(BaseSettings):
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

    # SMTP Service
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587  
    SMTP_USER: str = ""  
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_FROM_NAME: str = "Rieti"
    SMTP_TIMEOUT: int = 10  

    # Recovery
    RECOVERY_CODE_EXPIRE_MINUTES: int = 10
    RECOVERY_LINK_EXPIRE_MINUTES: int = 15
    RECOVERY_MAX_ATTEMPTS: int = 5  
    model_config = {"env_file": ".env"}

settings = Settings()