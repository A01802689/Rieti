from sqlalchemy import exists, func
from sqlalchemy.orm import Session, aliased

from app.models.caso import Caso
from app.models.municipio import Municipio
from app.models.reporte import Reporte
from app.models.ubicacion import Ubicacion
from app.models.seguimiento import Seguimiento
from app.models.usuario import Usuario
from app.models.usuario_caso import UsuarioCaso

def get_by_id(db: Session, id_caso: int) -> Caso | None:
    """Busca un caso por su identificador

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        El caso, o None si no existe
    """
    return db.get(Caso, id_caso)


def obtener_para_actualizar(db: Session, id_caso: int) -> Caso | None:
    """Busca un caso bloqueando su fila hasta el fin de la transacción

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        El caso bloqueado, o None si no existe
    """
    return db.query(Caso).filter(Caso.id_caso == id_caso).with_for_update().first()


def obtener_reporte_para_actualizar(db: Session, id_reporte: int) -> Reporte | None:
    """Busca un reporte bloqueando su fila hasta el fin de la transacción

    Args:
        db: sesión de base de datos
        id_reporte: identificador del reporte

    Returns:
        El reporte bloqueado, o None si no existe
    """
    return db.query(Reporte).filter(Reporte.id_reporte == id_reporte).with_for_update().first()


def obtener_id_municipio_ubicacion(db: Session, id_ubicacion: int) -> int | None:
    """Obtiene el municipio al que pertenece una ubicación

    Args:
        db: sesión de base de datos
        id_ubicacion: identificador de la ubicación

    Returns:
        El identificador del municipio, o None si la ubicación no existe
    """
    return db.query(Ubicacion.id_municipio).filter(Ubicacion.id_ubicacion == id_ubicacion).scalar()


def obtener_ubicacion(db: Session, id_ubicacion: int) -> Ubicacion | None:
    """Busca una ubicación por su identificador

    Args:
        db: sesión de base de datos
        id_ubicacion: identificador de la ubicación

    Returns:
        La ubicación, o None si no existe
    """
    return db.get(Ubicacion, id_ubicacion)


def obtener_datos_ubicacion(db: Session, id_ubicacion: int):
    """Lee los campos editables de una ubicación con las coordenadas separadas en lat y lng

    Args:
        db: sesión de base de datos
        id_ubicacion: identificador de la ubicación

    Returns:
        Fila con colonia, calle, referencia, lat y lng, o None si no existe
    """
    return (
        db.query(
            Ubicacion.colonia, Ubicacion.calle, Ubicacion.referencia,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
        )
        .filter(Ubicacion.id_ubicacion == id_ubicacion)
        .first()
    )


def _consulta_datos(db: Session):
    """Arma la consulta base de casos con municipios, ubicación, coordenadas y cantidad de reportes

    Args:
        db: sesión de base de datos

    Returns:
        La consulta sin filtros ni orden
    """
    municipio_ubicacion = aliased(Municipio)
    cantidad_reportes = (
        db.query(func.count(Reporte.id_reporte))
        .filter(Reporte.id_caso == Caso.id_caso)
        .correlate(Caso)
        .scalar_subquery()
    )
    return (
        db.query(
            Caso,
            Municipio.nombre.label("municipio"),
            municipio_ubicacion.nombre.label("municipio_ubicacion"),
            Ubicacion.colonia, Ubicacion.calle,
            func.ST_Y(Ubicacion.coordenadas).label("lat"),
            func.ST_X(Ubicacion.coordenadas).label("lng"),
            cantidad_reportes.label("cantidad_reportes"),
        )
        .join(Municipio, Municipio.id_municipio == Caso.id_municipio)
        .join(Ubicacion, Ubicacion.id_ubicacion == Caso.id_ubicacion)
        .join(municipio_ubicacion, municipio_ubicacion.id_municipio == Ubicacion.id_municipio)
    )


def listar(db: Session):
    """Lista todos los casos, del más reciente al más antiguo

    Args:
        db: sesión de base de datos

    Returns:
        Las filas de la consulta base de casos
    """
    return _consulta_datos(db).order_by(Caso.fecha_caso.desc(), Caso.id_caso.desc()).all()


def obtener_detalle(db: Session, id_caso: int):
    """Obtiene un caso con los datos de la consulta base

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        La fila del caso, o None si no existe
    """
    return _consulta_datos(db).filter(Caso.id_caso == id_caso).first()


def listar_seguimientos(db: Session, id_caso: int):
    """Lista los seguimientos de un caso con el nombre de su autor

    Args:
        db: sesión de base de datos
        id_caso: identificador del caso

    Returns:
        Filas con el seguimiento, nombre y apellido del autor, ordenadas por consecutivo
    """
    return (
        db.query(Seguimiento, Usuario.nombre, Usuario.apellido)
        .join(Usuario, Usuario.id_usuario == Seguimiento.id_usuario_autor)
        .filter(Seguimiento.id_caso == id_caso)
        .order_by(Seguimiento.consecutivo.asc())
        .all()
    )


def listar_para_eliminar(db: Session, ids_caso: list[int]) -> list[Caso]:
    """Obtiene varios casos bloqueando sus filas hasta el fin de la transacción

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos

    Returns:
        Los casos encontrados, ordenados por identificador
    """
    return (
        db.query(Caso)
        .filter(Caso.id_caso.in_(ids_caso))
        .order_by(Caso.id_caso)
        .with_for_update()
        .all()
    )


def listar_reportes_de_casos(db: Session, ids_caso: list[int]):
    """Lista los reportes que pertenecen a los casos indicados

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos

    Returns:
        Pares de identificador de caso e identificador de reporte
    """
    return (
        db.query(Reporte.id_caso, Reporte.id_reporte)
        .filter(Reporte.id_caso.in_(ids_caso))
        .order_by(Reporte.id_reporte)
        .all()
    )


def contar_seguimientos_de_casos(db: Session, ids_caso: list[int]):
    """Cuenta los seguimientos de cada caso indicado

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos

    Returns:
        Pares de identificador de caso y cantidad de seguimientos
    """
    return (
        db.query(Seguimiento.id_caso, func.count(Seguimiento.id_seguimiento))
        .filter(Seguimiento.id_caso.in_(ids_caso))
        .group_by(Seguimiento.id_caso)
        .all()
    )


def liberar_reportes(db: Session, ids_caso: list[int]) -> None:
    """Desvincula de sus casos a los reportes indicados y les quita el estatus de seguimiento

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos cuyos reportes se liberan
    """
    (
        db.query(Reporte)
        .filter(Reporte.id_caso.in_(ids_caso))
        .update(
            {Reporte.id_caso: None, Reporte.estatus_seguimiento: None},
            synchronize_session=False,
        )
    )


def eliminar_seguimientos(db: Session, ids_caso: list[int]) -> None:
    """Elimina los seguimientos de los casos indicados

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos
    """
    db.query(Seguimiento).filter(Seguimiento.id_caso.in_(ids_caso)).delete(synchronize_session=False)


def eliminar_usuarios_caso(db: Session, ids_caso: list[int]) -> None:
    """Elimina las asignaciones de usuarios a los casos indicados

    Args:
        db: sesión de base de datos
        ids_caso: identificadores de los casos
    """
    db.query(UsuarioCaso).filter(UsuarioCaso.id_caso.in_(ids_caso)).delete(synchronize_session=False)


def eliminar_casos(db: Session, casos: list[Caso]) -> None:
    """Elimina los casos indicados

    Args:
        db: sesión de base de datos
        casos: casos ya cargados a eliminar
    """
    for caso in casos:
        db.delete(caso)
    db.flush()


def eliminar_ubicaciones_sin_uso(db: Session, ids_ubicacion: list[int]) -> None:
    """Elimina de las ubicaciones indicadas las que ya no usa ningún reporte ni caso

    Args:
        db: sesión de base de datos
        ids_ubicacion: identificadores de las ubicaciones candidatas
    """
    (
        db.query(Ubicacion)
        .filter(
            Ubicacion.id_ubicacion.in_(ids_ubicacion),
            ~exists().where(Reporte.id_ubicacion == Ubicacion.id_ubicacion),
            ~exists().where(Caso.id_ubicacion == Ubicacion.id_ubicacion),
        )
        .delete(synchronize_session=False)
    )
