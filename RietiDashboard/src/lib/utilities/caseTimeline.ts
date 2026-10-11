import type { Caso, Seguimiento } from '../types/Case';

/**
 * Builds the folio of a case, e.g. CASO-2026-0012
 *
 * @param c - Case id and creation date
 */
export const caseFolio = (c: Pick<Caso, 'id_caso' | 'fecha_caso'>) =>
  `CASO-${new Date(c.fecha_caso).getFullYear()}-${String(c.id_caso).padStart(4, '0')}`;

/**
 * Builds the folio of a timeline entry, e.g. SEG-2026-0012-01
 *
 * @param c - Case id and creation date
 * @param n - Position of the entry in the timeline
 */
export const seguimientoFolio = (c: Pick<Caso, 'id_caso' | 'fecha_caso'>, n: number) =>
  `SEG-${new Date(c.fecha_caso).getFullYear()}-${String(c.id_caso).padStart(4, '0')}-${String(n).padStart(2, '0')}`;

/**
 * Gives the timeline of a case; a case without one gets its reception entry derived
 *
 * @param c - Case to read
 * @returns The entries of the timeline
 */
export function timelineOf(c: Caso): Seguimiento[] {
  if (c.seguimientos && c.seguimientos.length > 0) return c.seguimientos;
  return [
    {
      folio: seguimientoFolio(c, 1),
      fecha: c.fecha_caso,
      tipo: 'Recepción de reporte',
      autor: 'Sistema',
      nota: c.notas || null,
    },
  ];
}
