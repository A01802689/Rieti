import { useMemo, useState } from 'react';
import type { Caso } from '../types/Case';
import type { Reporte } from '../types/Report';
import { cases } from '../api/cases';
import { getReports } from '../api/reports';
import { useStoreVersion } from '../api/store';

/** Filter option that shows every case */
export const ALL_OPTION = 'Todos';
const STATE_ORDER = ['Abierto', 'En desarrollo', 'Cerrado'];

/**
 * Lowercases a text and removes its accents for searching
 *
 * @param text - Text to normalize
 */
const normalize = (text: string | null | undefined) =>
  (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * View model of the cases list: filters by state, searches by id, colonia or calle, and counts the reports of each case
 *
 * @returns The visible cases, report counts, filter options and their setters
 */
export function useCasesViewModel() {
  const version = useStoreVersion();
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION);
  const [searchQuery, setSearchQuery] = useState('');

  const reportCounts = useMemo(() => {
    const counts = new Map<number, number>();
    getReports().forEach((r) => {
      if (r.id_caso !== null) counts.set(r.id_caso, (counts.get(r.id_caso) ?? 0) + 1);
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const filterOptions = useMemo(
    () => [
      { value: ALL_OPTION, total: cases.length },
      ...STATE_ORDER.map((state) => ({ value: state, total: cases.filter((c) => c.estado === state).length })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const filteredCases = useMemo(() => {
    const query = normalize(searchQuery.trim());
    return cases
      .filter((c) => selectedFilter === ALL_OPTION || c.estado === selectedFilter)
      .filter(
        (c) =>
          !query ||
          String(c.id_caso).includes(query) ||
          normalize(c.ubicacion.colonia).includes(query) ||
          normalize(c.ubicacion.calle).includes(query),
      )
      .sort((a, b) => new Date(b.fecha_caso).getTime() - new Date(a.fecha_caso).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, selectedFilter, searchQuery]);

  return {
    cases: filteredCases,
    reportCounts,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
  };
}

/**
 * View model of the case page
 *
 * @param id - id_caso to show
 * @returns The case and its reports, oldest first
 */
export function useCaseDetail(id: number): { caso: Caso | undefined; reports: Reporte[] } {
  const version = useStoreVersion();
  return useMemo(
    () => ({
      caso: cases.find((c) => c.id_caso === id),
      reports: getReports()
        .filter((r) => r.id_caso === id)
        .sort((a, b) => new Date(a.fecha_reporte).getTime() - new Date(b.fecha_reporte).getTime()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );
}
