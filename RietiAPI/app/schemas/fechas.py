from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator, PlainSerializer, WithJsonSchema


def _a_utc(valor: datetime) -> datetime:
    """Lleva una fecha a UTC

    Args:
        valor: fecha recibida, con o sin zona

    Returns:
        La misma fecha en UTC; si no traía zona se toma como UTC, que es lo que guarda la base
    """
    if valor.tzinfo is None:
        return valor.replace(tzinfo=timezone.utc)
    return valor.astimezone(timezone.utc)


def _a_texto(valor: datetime) -> str:
    """Escribe una fecha en ISO 8601 terminada en Z

    Args:
        valor: fecha en UTC

    Returns:
        El texto, por ejemplo 2026-10-18T05:27:18.123456Z
    """
    return valor.isoformat().replace("+00:00", "Z")


#: Fecha que la API siempre manda en UTC y con la Z al final, para que cada cliente la convierta a su zona
FechaUTC = Annotated[
    datetime,
    AfterValidator(_a_utc),
    PlainSerializer(_a_texto, return_type=str, when_used="json"),
    WithJsonSchema({"type": "string", "format": "date-time"}),
]
