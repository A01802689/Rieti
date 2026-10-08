BEGIN;

CREATE TABLE IF NOT EXISTS folio_contador (
    id_folio_contador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_municipio INTEGER NOT NULL
        REFERENCES municipio(id_municipio),
    anio INTEGER NOT NULL CHECK (anio BETWEEN 2000 AND 9999),
    ultimo_consecutivo INTEGER NOT NULL DEFAULT 0
        CHECK (ultimo_consecutivo >= 0),
    CONSTRAINT uq_folio_contador_municipio_anio
        UNIQUE (id_municipio, anio)
);

-- El modelo Reporte usa estas columnas para almacenar el folio y, después,
-- la clave de la imagen alojada en S3.
ALTER TABLE reporte
    ALTER COLUMN folio_reporte TYPE VARCHAR(60);

ALTER TABLE reporte
    ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);

COMMIT;
