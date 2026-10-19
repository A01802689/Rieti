import { useMemo, useState, useEffect } from 'react'
import { REPORT_STATUS, type Reporte } from '@/lib/types/Report'
import { useAuth } from '@/context/auth'
import { isForbidden } from '@/lib/api/client'
import { deleteReports, getReport, getReports } from '@/lib/api/reports'
import { parseApiDate } from '@/lib/utilities/date'
import { useDetail } from '@/lib/utilities/useDetail'
import { useSelection } from '@/lib/utilities/useSelection'
import { normalizeText } from '@/lib/utilities/text'
import { ALL_OPTION } from '@/lib/utilities/filters'

/** Status whose reports an admin can select to delete them */
const DELETABLE_STATUS = 'Rechazado'

/** Statuses in workflow order, used to sort the filter options */
const STATUS_WORKFLOW_ORDER = [...REPORT_STATUS].filter( (status) => status != "Rechazado" )

/**
 * View model of the reports list: filters by status, searches by folio, colonia, calle or work type, and sorts by newest
 *
 * @returns The visible reports, loading flag, `forbidden` (the API refused to list them), `reload` to fetch them again, filter options with their setters, search text with its setter, `canSelect` (an admin looking at the rejected reports), the `selection` of reports and `removeSelected`, which deletes the picked ones, drops the selection and reloads
 */
export function useReports() {
  const { isAdmin } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION)
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<Reporte[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [forbidden, setForbidden] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  // bumping it re-runs the effect, which reloads the list
  const [version, setVersion] = useState(0)

  /** Fetches the reports again */
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    let stale = false
    const getData = async () => {
      try {
        const reports = await getReports()
        if (stale) return
        setReports(reports)
        setForbidden(false)
        setLoadFailed(false)
      } catch (e) {
        console.error(`Error fetching reports and case from api ${e}`)
        if (stale) return
        setReports([])
        setForbidden(isForbidden(e))
        setLoadFailed(!isForbidden(e))
      } finally {
        if (!stale) setLoading(false)
      }
    }

    getData()
    return () => { stale = true }
  }, [version])

  const filterOptions = useMemo(() => {
    const countsMap = new Map<string, number>()
    reports.forEach((report) => {
      const status = report.estatus_seguimiento ?? 'Sin estatus'
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
    const query = normalizeText(searchQuery.trim())
    return reports
      .filter(
        (report) =>
          activeFilter === ALL_OPTION ||
          (report.estatus_seguimiento ?? 'Sin estatus') === activeFilter
      )
      .filter(
        (report) =>
          !query ||
          normalizeText(report.folio_reporte).includes(query) ||
          normalizeText(report.ubicacion.colonia).includes(query) ||
          normalizeText(report.ubicacion.calle).includes(query) ||
          normalizeText(report.tipo_trabajo).includes(query)
      )
      .sort(
        (a, b) =>
          parseApiDate(b.fecha_reporte).getTime() -
          parseApiDate(a.fecha_reporte).getTime()
      )
  }, [reports, activeFilter, searchQuery])

  const canSelect = isAdmin && activeFilter === DELETABLE_STATUS
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
    forbidden,
    loadFailed,
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
 * @returns The report (undefined if missing), the loading flag, `forbidden` (the API refused to show it), `mutate` to change it and `reload` to fetch it again
 */
export function useReport(id: number) {
  const { data, loading, forbidden, error, mutate, reload } = useDetail(id, getReport)

  return { report: data, loading, forbidden, error, mutate, reload }
}
