-- Ejecutar una vez sobre la base existente.
-- El detalle de la API calcula notas desde el último seguimiento.
-- Conserva seguimiento.nota y todas las filas de caso y seguimiento.
BEGIN;

LOCK TABLE caso IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM caso
        WHERE notas IS NOT NULL AND btrim(notas) <> ''
    ) THEN
        RAISE EXCEPTION 'caso.notas contiene textos: conservarlos antes de eliminar la columna';
    END IF;
END;
$$;

ALTER TABLE caso DROP COLUMN notas;

COMMIT;
