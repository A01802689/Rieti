import { useMemo } from 'react';
import { cases } from '../api/cases';
import { getReports } from '../api/reports';
import { useStoreVersion } from '../api/store';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const GRAPH_MONTHS = 6;
const CASE_STATES = ['Abierto', 'En desarrollo', 'Cerrado'];
const REPORT_STATUSES = ['Recibido', 'En revisión', 'Canalizado', 'En atención', 'Concluido', 'Rechazado'];

/**
 * Numbers of the home page, computed from the cases and reports data.
 *
 * @returns The KPI cards and the points of the "cases per month" chart
 */
export function useHomeViewModel(now: Date = new Date()) {
  const version = useStoreVersion();

  return useMemo(() => {
    const year = now.getFullYear();
    const reports = getReports();

    const stats = [
      { label: 'Casos', value: String(cases.length), note: 'registrados', tone: 'bg-amber-500' },
      { label: 'Reportes recibidos', value: String(reports.length), note: 'en total', tone: 'bg-teal-600' },
      {
        label: 'Casos cerrados',
        value: String(cases.filter((c) => c.estado === 'Cerrado').length),
        note: 'Con restitución de derechos',
        tone: 'bg-emerald-600',
      },
      {
        label: 'Reportes canalizados',
        value: String(reports.filter((r) => r.id_caso !== null).length),
        note: 'asignados a un caso',
        tone: 'bg-blue-600',
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

    const caseStatus = CASE_STATES.map((value) => ({ value, total: cases.filter((c) => c.estado === value).length }));
    const reportStatus = REPORT_STATUSES.map((value) => ({
      value,
      total: reports.filter((r) => r.estatus_seguimiento === value).length,
    }));

    return { stats, graphData, caseStatus, reportStatus };
    // `version` changes when the mock data is mutated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
}
