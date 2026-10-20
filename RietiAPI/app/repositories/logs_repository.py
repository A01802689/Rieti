from typing import Any

from sqlalchemy import String, Text, cast, func, or_
from sqlalchemy.orm import Session

from app.models.logs import EntityType, Log
from app.models.usuario import Usuario


def listar(
    db: Session,
    entity_type: EntityType | None = None,
    limite: int = 100,
    desplazamiento: int = 0,
    buscar: str | None = None,
):
    """Lista las entradas de la bitácora con el nombre completo de quien actuó

    Args:
        db: sesión de base de datos
        entity_type: tipo de entidad para filtrar, None para todos
        limite: máximo de filas
        desplazamiento: filas a saltar
        buscar: texto buscado sin distinguir mayúsculas en el nombre, la acción o el identificador del registro

    Returns:
        Filas de la más reciente a la más antigua
    """
    nombre_usuario = func.trim(
        func.concat(Usuario.nombre, " ", Usuario.apellido),
        type_=String,
    )
    consulta = (
        db.query(
            Log.id_logs,
            Log.id_usuario,
            nombre_usuario.label("usuario"),
            Log.action,
            Log.entity_type,
            Log.id_registro_afectado,
            Log.before_data,
            Log.after_data,
            Log.fecha,
        )
        .join(Usuario, Log.id_usuario == Usuario.id_usuario)
    )
    if entity_type is not None:
        consulta = consulta.filter(Log.entity_type == entity_type)
    if buscar:
        consulta = consulta.filter(
            or_(
                nombre_usuario.icontains(buscar, autoescape=True),
                Log.action.icontains(buscar, autoescape=True),
                cast(Log.id_registro_afectado, Text).icontains(buscar, autoescape=True),
            )
        )

    return (
        consulta.order_by(Log.fecha.desc(), Log.id_logs.desc())
        .limit(limite)
        .offset(desplazamiento)
        .all()
    )


def registrar(
    db: Session,
    id_usuario: int,
    action: str,
    entity_type: EntityType,
    id_registro_afectado: int,
    before_data: dict[str, Any],
    after_data: dict[str, Any] | None = None,
) -> Log:
    """Inserta una entrada en la bitácora sin confirmar la transacción

    Args:
        db: sesión de base de datos
        id_usuario: identificador de quien realizó la acción
        action: descripción de la acción
        entity_type: tipo de entidad afectada
        id_registro_afectado: identificador del registro afectado
        before_data: valores anteriores
        after_data: valores nuevos, None si no aplica

    Returns:
        La entrada creada
    """
    nuevo_log = Log(
        id_usuario=id_usuario,
        action=action,
        entity_type=entity_type,
        id_registro_afectado=id_registro_afectado,
        before_data=before_data,
        after_data=after_data,
    )
    db.add(nuevo_log)
    db.flush()
    return nuevo_log


def eliminar_por_usuario(db: Session, id_usuario: int) -> int:
    """Elimina las entradas de bitácora de un usuario

    Args:
        db: sesión de base de datos
        id_usuario: identificador del usuario

    Returns:
        Número de entradas eliminadas
    """
    return (
        db.query(Log)
        .filter(Log.id_usuario == id_usuario)
        .delete(synchronize_session=False)
    )
