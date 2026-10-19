from pydantic import BaseModel


class IndicadoresLoginResponse(BaseModel):
    reportes_registrados: int
    casos_activos: int
    ninos_atendidos: int
