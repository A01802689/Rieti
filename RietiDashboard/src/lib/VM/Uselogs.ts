import { useMemo, useState } from 'react';
import { logs } from '../api/logs';

export const ALL_OPTION = 'Todos';
const ENTITY_ORDER = ['usuario', 'municipio', 'reporte', 'ubicacion', 'caso'];

const normalize = (text: string | null | undefined) =>
  (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function useLogsViewModel() {
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION);
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = useMemo(
    () => [
      { value: ALL_OPTION, total: logs.length },
      ...ENTITY_ORDER.map((entity) => ({ value: entity, total: logs.filter((l) => l.entity_type === entity).length })),
    ],
    [],
  );

  const filteredLogs = useMemo(() => {
    const query = normalize(searchQuery.trim());
    return logs
      .filter((l) => selectedFilter === ALL_OPTION || l.entity_type === selectedFilter)
      .filter(
        (l) =>
          !query ||
          normalize(l.usuario).includes(query) ||
          normalize(l.action).includes(query) ||
          String(l.id_registro_afectado).includes(query),
      )
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [selectedFilter, searchQuery]);

  return { logs: filteredLogs, filterOptions, selectedFilter, setSelectedFilter, searchQuery, setSearchQuery };
}
