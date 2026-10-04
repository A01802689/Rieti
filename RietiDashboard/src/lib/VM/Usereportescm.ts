import { useMemo, useState } from 'react';
import type { Reporte } from '../types/Report';
// TODO: ajusta la ruta a donde esté tu archivo con `reports`
import { getReports } from '../api/reports';

export const TODOS = 'Todos';

// Orden del flujo: sólo sirve para acomodar los filtros, no para inventar estatus.
// Si aparece un estatus nuevo en los datos, se agrega al final automáticamente.
const ORDEN_FLUJO = ['Recibido', 'En revisión', 'Canalizado', 'En atención', 'Concluido'];

function normalizar(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function useReportesVM() {
  const [filtro, setFiltro] = useState<string>(TODOS);
  const [busqueda, setBusqueda] = useState('');

  // TODO: cuando exista el endpoint, `reports` vendrá del fetch en vez del import
  const todos: Reporte[] = getReports();

  // Filtros con conteo, sacados de los datos: [{ value: 'Recibido', total: 11 }, ...]
  const filtros = useMemo(() => {
    const conteo = new Map<string, number>();
    todos.forEach((r) => {
      const estatus = r.estatus_seguimiento ?? '';
      conteo.set(estatus, (conteo.get(estatus) ?? 0) + 1);
    });
    const posicion = (e: string) => {
      const i = ORDEN_FLUJO.indexOf(e);
      return i === -1 ? ORDEN_FLUJO.length : i;
    };
    const estatus = [...conteo.keys()].sort((a, b) => posicion(a) - posicion(b));
    return [
      { value: TODOS, total: todos.length },
      ...estatus.map((e) => ({ value: e, total: conteo.get(e) ?? 0 })),
    ];
  }, [todos]);

  const reportes = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return todos
      .filter((r) => filtro === TODOS || r.estatus_seguimiento === filtro)
      .filter(
        (r) =>
          !q ||
          normalizar(r.folio_reporte).includes(q) ||
          normalizar(r.ubicacion.colonia).includes(q) ||
          normalizar(r.ubicacion.calle).includes(q) ||
          normalizar(r.tipo_trabajo).includes(q),
      )
      .sort((a, b) => new Date(b.fecha_reporte).getTime() - new Date(a.fecha_reporte).getTime());
  }, [todos, filtro, busqueda]);

  return { reportes, filtros, filtro, setFiltro, busqueda, setBusqueda };
}