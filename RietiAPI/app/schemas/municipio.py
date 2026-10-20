from pydantic import BaseModel


#Le da permiso a Pydantic para que, en vez de únicamente 
# saber leer diccionarios (obj["nombre"]), también sepa leer objetos con atributos por punto
class MunicipioResponse(BaseModel):
    """Municipio del catálogo

    Attributes:
        clave: clave interna de RIETI, no es la oficial de INEGI
    """
    id_municipio: int
    nombre: str
    clave: str
    model_config = {"from_attributes": True}
