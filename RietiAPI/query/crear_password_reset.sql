-- Migracion aditiva: solo crea la tabla de recuperacion de contrasena; no toca ninguna tabla existente.
-- Guarda el HASH del codigo o token enviado por correo (nunca el valor en claro). Ver app/models/password_reset.py
BEGIN;

CREATE TABLE password_reset (
    id_password_reset INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    secret_hash VARCHAR(64) NOT NULL,
    method VARCHAR(8) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_password_reset_method CHECK (method IN ('code', 'link'))
);

CREATE INDEX ix_password_reset_id_user
    ON password_reset (id_user);

COMMIT;
