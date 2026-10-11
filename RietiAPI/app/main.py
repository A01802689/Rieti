from fastapi import FastAPI
from app.api.routes import usuario as usuario_routes
from app.api.routes import municipio as municipio_routes
from app.api.routes import reporte as reporte_routes
from app.models import municipio, usuario
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Rieti API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.DASHBOARD_ORIGIN, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_routes.router)
app.include_router(municipio_routes.router)
app.include_router(reporte_routes.router)

@app.get("/")
def read_root():
    return {"message": "Rieti API funcionando"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


app.state.limiter = limiter #conceta el limiter con app 
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
#si excede el numero de peticones manda un error el 429