import { useMemo, useState, useEffect } from 'react'
import { REPORT_STATUS, type Reporte } from '@/lib/types/Report'
import { deleteReports, getReport, getReports } from '@/lib/api/reports'
import { useDetail } from '@/lib/utilities/useDetail'
import { useSelection } from '@/lib/utilities/useSelection'
import { isAdmin, useRole } from '@/lib/utilities/useRole'

/** Filter option that shows every report */
export const ALL_OPTION = 'Todos'

/** Status whose reports an admin can select to delete them */
const DELETABLE_STATUS = 'Rechazado'

/** Statuses in workflow order, used to sort the filter options */
const STATUS_WORKFLOW_ORDER = [...REPORT_STATUS].filter( (status) => status != "Rechazado" )

/**
 * Lowercases a text and removes its accents for searching
 *
 * @param text - Text to normalize
 * @returns The normalized text
 */
function normalizeString(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * View model of the reports list: filters by status, searches by folio, colonia, calle or work type, and sorts by newest
 *
 * @returns The visible reports, loading flag, `reload` to fetch them again, filter options with their setters, search text with its setter, `canSelect` (an admin looking at the rejected reports), the `selection` of reports and `removeSelected`, which deletes the picked ones, drops the selection and reloads
 */
export function useReports() {
  const role = useRole()
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION)
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<Reporte[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  // bumping it re-runs the effect, which reloads the list
  const [version, setVersion] = useState(0)

  /** Fetches the reports again */
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    const getData = async () => {
      try {
        const reports = await getReports()
        setReports(reports)
      } catch (e) {
        console.error(`Error fetching reports and case from api ${e}`)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [version])

  const filterOptions = useMemo(() => {
    const countsMap = new Map<string, number>()
    reports.forEach((report) => {
      const status = report.estatus_seguimiento ?? ''
      countsMap.set(status, (countsMap.get(status) ?? 0) + 1)
    })

    /**
     * Gives the position of a status in the workflow; unknown ones go last
     *
     * @param status - Status to look up
     */
    const getStatusIndex = (status: string) => {
      const index = STATUS_WORKFLOW_ORDER.indexOf(status)
      return index === -1 ? STATUS_WORKFLOW_ORDER.length : index
    }

    const sortedStatuses = [...countsMap.keys()].sort(
      (a, b) => getStatusIndex(a) - getStatusIndex(b)
    )

    return [
      { value: ALL_OPTION, total: reports.length },
      ...sortedStatuses.map((status) => ({
        value: status,
        total: countsMap.get(status) ?? 0,
      })),
    ]
  }, [reports])

  // a filter with no reports left (all rejected ones were deleted or reopened) falls back to showing every report
  const activeFilter = filterOptions.some((option) => option.value === selectedFilter) ? selectedFilter : ALL_OPTION

  const filteredReports = useMemo(() => {
    const query = normalizeString(searchQuery.trim())
    return reports
      .filter(
        (report) =>
          activeFilter === ALL_OPTION ||
          report.estatus_seguimiento === activeFilter
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
      )
  }, [reports, activeFilter, searchQuery])

  const canSelect = isAdmin(role) && activeFilter === DELETABLE_STATUS
  const selection = useSelection(canSelect, filteredReports.map((report) => report.id_reporte))

  /**
   * Deletes the picked reports, leaves the selection mode and reloads the list
   *
   * @returns The ids deleted and the ids skipped by the API
   */
  const removeSelected = async () => {
    const result = await deleteReports(selection.ids)
    selection.clear()
    reload()
    return result
  }

  return {
    reports: filteredReports,
    loading,
    reload,
    filterOptions,
    selectedFilter: activeFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    canSelect,
    selection,
    removeSelected,
  }
}

/**
 * View model of one report page
 *
 * @param id - Report id, as it comes from the route
 * @returns The report (undefined if missing), the loading flag, `mutate` to change it and `reload` to fetch it again
 */
export function useReport(id: number) {
  const { data, loading, mutate, reload } = useDetail(id, getReport)

  return { report: data, loading, mutate, reload }
}
