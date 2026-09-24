from sqlalchemy import create_engine # crea la conexión hacia tu base de datos.
from sqlalchemy.orm import sessionmaker
 #create_engine, crea la conexión general hacia la base de datos, pero para poder 
# hacer consultas, leer, insertar, actualizar datos usamos sessionmaker.
from app.core.config import settings
from urllib.parse import quote_plus #esto porque agregue un # en el password y eso hace que se rompa



password = quote_plus(settings.DB_PASSWORD)
DATABASE_URL = f"postgresql+psycopg://{settings.DB_USER}:{password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)