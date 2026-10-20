from slowapi import Limiter # es quine cuenta las limitaciones
from slowapi.util import get_remote_address  # identifica cada cliente por su ip 

#: limitador de peticiones por dirección IP, se aplica con @limiter.limit en cada ruta
limiter = Limiter(key_func=get_remote_address)