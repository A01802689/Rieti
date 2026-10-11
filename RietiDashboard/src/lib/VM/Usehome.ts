import { useMemo } from 'react';
import { cases } from '../api/cases';
import { municipios } from '../api/municipios';
import { useStoreVersion } from '../api/store';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const GRAPH_MONTHS = 6;

/**
 * Numbers of the home page, computed from the cases and municipios data.
 *
 * @returns The KPI cards and the points of the "cases per month" chart
 */
export function useHomeViewModel(now: Date = new Date()) {
  const version = useStoreVersion();

  return useMemo(() => {
    const year = now.getFullYear();
    const thisYear = cases.filter((c) => new Date(c.fecha_caso).getFullYear() === year);

    const stats = [
      { label: 'Municipios participantes', value: String(municipios.length), note: 'en la ruta', tone: 'bg-teal-600' },
      { label: 'Casos identificados', value: String(thisYear.length), note: 'este año', tone: 'bg-amber-500' },
      {
        label: 'Casos en seguimiento',
        value: String(cases.filter((c) => c.estado === 'En desarrollo').length),
        note: 'activos',
        tone: 'bg-blue-600',
      },
      {
        label: 'Casos cerrados',
        value: String(cases.filter((c) => c.estado === 'Cerrado').length),
        note: 'Con restitución de derechos',
        tone: 'bg-emerald-600',
      },
    ];

    // cases per month, last GRAPH_MONTHS months ending at the current one
    const graphData = Array.from({ length: GRAPH_MONTHS }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (GRAPH_MONTHS - 1 - i), 1);
      const value = cases.filter((c) => {
        const d = new Date(c.fecha_caso);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      }).length;
      const name = date.getFullYear() === year ? MONTHS[date.getMonth()] : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      return { name, value };
    });

    return { stats, graphData };
    // `version` changes when the mock data is mutated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
}
