from pydantic_settings import BaseSettings
#debe ser igual el nomrbe a los que declare en el env
class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    model_config = {"env_file": ".env"}

# settings con minuscula es una instancia de la clase Settings
settings = Settings()