from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.password_reset import PasswordReset


# Las reglas estan en services/recovery_service.py, no aquí


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create(db: Session, *, id_user: int, secret_hash: str, method: str, expires_at: datetime) -> PasswordReset:
    db.query(PasswordReset).filter(
        PasswordReset.id_user == id_user,
        PasswordReset.used.is_(False),
    ).update({PasswordReset.used: True})
    request = PasswordReset(id_user=id_user, secret_hash=secret_hash, method=method, expires_at=expires_at)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def get_active_by_user(db: Session, id_user: int, method: str | None = None) -> PasswordReset | None:
    query = db.query(PasswordReset).filter(
        PasswordReset.id_user == id_user,
        PasswordReset.used.is_(False),
        PasswordReset.expires_at > _now(),
    )
    if method:
        query = query.filter(PasswordReset.method == method)
    return query.order_by(PasswordReset.created_at.desc()).first()


def get_active_by_hash(db: Session, secret_hash: str) -> PasswordReset | None:
    return (
        db.query(PasswordReset)
        .filter(
            PasswordReset.secret_hash == secret_hash,
            PasswordReset.used.is_(False),
            PasswordReset.expires_at > _now(),
        )
        .first()
    )

def add_attempt(db: Session, request: PasswordReset) -> PasswordReset:
    db.query(PasswordReset).filter(PasswordReset.id_password_reset == request.id_password_reset).update(
        {PasswordReset.attempts: PasswordReset.attempts + 1}
    )
    db.commit()
    db.refresh(request)
    return request


def mark_used(db: Session, request: PasswordReset) -> bool:
    changed = (
        db.query(PasswordReset)
        .filter(PasswordReset.id_password_reset == request.id_password_reset, PasswordReset.used.is_(False))
        .update({PasswordReset.used: True})
    )
    db.commit()
    return changed == 1
