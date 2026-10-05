import { useMemo, useState } from 'react';
import type { Reporte } from '../types/Report';
// TODO: ajusta la ruta a donde esté tu archivo con `reports`
import { getReports } from '../api/reports';

export const ALL_OPTION = 'Todos';

const STATUS_WORKFLOW_ORDER = [
  'Recibido',
  'En revisión',
  'Canalizado',
  'En atención',
  'Concluido',
];

function normalizeString(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function useReportsViewModel() {
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION);
  const [searchQuery, setSearchQuery] = useState('');

  const allReports: Reporte[] = getReports();

  const filterOptions = useMemo(() => {
    const countsMap = new Map<string, number>();
    allReports.forEach((report) => {
      const status = report.estatus_seguimiento ?? '';
      countsMap.set(status, (countsMap.get(status) ?? 0) + 1);
    });

    const getStatusIndex = (status: string) => {
      const index = STATUS_WORKFLOW_ORDER.indexOf(status);
      return index === -1 ? STATUS_WORKFLOW_ORDER.length : index;
    };

    const sortedStatuses = [...countsMap.keys()].sort(
      (a, b) => getStatusIndex(a) - getStatusIndex(b)
    );

    return [
      { value: ALL_OPTION, total: allReports.length },
      ...sortedStatuses.map((status) => ({
        value: status,
        total: countsMap.get(status) ?? 0,
      })),
    ];
  }, [allReports]);

  const filteredReports = useMemo(() => {
    const query = normalizeString(searchQuery.trim());
    return allReports
      .filter(
        (report) =>
          selectedFilter === ALL_OPTION ||
          report.estatus_seguimiento === selectedFilter
      )
      .filter(
        (report) =>
          !query ||
          normalizeString(report.folio_reporte).includes(query) ||
          normalizeString(report.ubicacion.colonia).includes(query) ||
          normalizeString(report.ubicacion.calle).includes(query) ||
          normalizeString(report.tipo_trabajo).includes(query)
      )
      .sort(
        (a, b) =>
          new Date(b.fecha_reporte).getTime() -
          new Date(a.fecha_reporte).getTime()
      );
  }, [allReports, selectedFilter, searchQuery]);

  return {
    reports: filteredReports,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
  };
}