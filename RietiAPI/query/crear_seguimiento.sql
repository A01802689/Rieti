-- Migracion aditiva: conserva los casos y reportes existentes.
-- El nombre del autor se obtiene de usuario al consultar el seguimiento.
BEGIN;

CREATE TABLE seguimiento (
    id_seguimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_caso INTEGER NOT NULL REFERENCES caso(id_caso),
    id_usuario_autor INTEGER NOT NULL REFERENCES usuario(id_usuario),
    consecutivo INTEGER NOT NULL CHECK (consecutivo > 0),
    folio VARCHAR(80) NOT NULL UNIQUE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
    tipo VARCHAR(32) NOT NULL CHECK (
        tipo IN (
            'Recepción de reporte',
            'Nota',
            'Cambio de estado',
            'Transferencia'
        )
    ),
    nota TEXT NOT NULL,
    CONSTRAINT uq_seguimiento_caso_consecutivo
        UNIQUE (id_caso, consecutivo),
    CONSTRAINT ck_seguimiento_nota_no_vacia
        CHECK (length(btrim(nota)) > 0)
);

CREATE INDEX ix_seguimiento_caso_fecha
    ON seguimiento (id_caso, fecha, id_seguimiento);

COMMIT;
