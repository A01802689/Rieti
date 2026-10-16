-- Ejecutar una vez sobre la base existente. No borra casos ni reportes.
-- Reutiliza los catálogos enum definidos en query.txt.
-- Los registros existentes quedan con 'No sé'; nunca se infieren de reportes.
BEGIN;

ALTER TABLE caso
    ADD COLUMN cantidad_nna cantidad_nna_reporte NOT NULL DEFAULT 'No sé',
    ADD COLUMN edad_aproximada edad_aproximada_reporte NOT NULL DEFAULT 'No sé',
    ADD COLUMN tipo_trabajo tipo_trabajo_reporte NOT NULL DEFAULT 'No sé';

COMMIT;
