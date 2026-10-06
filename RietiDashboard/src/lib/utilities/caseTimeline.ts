import type { Caso, Seguimiento } from '../types/Case';

export const caseFolio = (c: Pick<Caso, 'id_caso' | 'fecha_caso'>) =>
  `CASO-${new Date(c.fecha_caso).getFullYear()}-${String(c.id_caso).padStart(4, '0')}`;

export const seguimientoFolio = (c: Pick<Caso, 'id_caso' | 'fecha_caso'>, n: number) =>
  `SEG-${new Date(c.fecha_caso).getFullYear()}-${String(c.id_caso).padStart(4, '0')}-${String(n).padStart(2, '0')}`;

// Timeline of a case; cases created before timelines existed get their reception entry derived.
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
