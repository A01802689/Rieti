from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, func

from app.db.base import Base


class PasswordReset(Base):
    __tablename__ = "password_reset"

    id_password_reset = Column(Integer, primary_key=True)
    # De quién es la solicitud
    id_user = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
    )
    # Hash HMAC-SHA256 
    secret_hash = Column(String(64), nullable=False)
    method = Column(String(8), nullable=False)
    # RECOVERY_CODE_EXPIRE_MINUTES y RECOVERY_LINK_EXPIRE_MINUTES en config.py definen cuánto dura
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, nullable=False, default=False, server_default="false")
    # Intentos fallidos al ingresar el codigo
    attempts = Column(Integer, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("method IN ('code', 'link')", name="ck_password_reset_method"),
        Index("ix_password_reset_id_user", "id_user"),
    )
