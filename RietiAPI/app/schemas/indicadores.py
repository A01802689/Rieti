from pydantic import BaseModel


class IndicadoresLoginResponse(BaseModel):
    """Indicadores públicos de la pantalla de inicio de sesión

    Attributes:
        casos_activos: casos Abiertos o En desarrollo
        ninos_atendidos: niños de los casos En desarrollo o Cerrados
    """
    reportes_registrados: int
    casos_activos: int
    ninos_atendidos: int
