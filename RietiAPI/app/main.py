from fastapi import FastAPI
from app.api.routes import usuario as usuario_routes
from app.models import municipio, usuario

app = FastAPI(
    title="Rieti API",
    version="0.1.0"
)

app.include_router(usuario_routes.router)

@app.get("/")
def read_root():
    return{
        "message": "Rieti API funcionando"
    }

@app.get("/health")
def health_check():
    return{
        "status": "ok"
    }