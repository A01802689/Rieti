import { useState, useMemo, useEffect } from "react"
import { deleteCases, getCase, getCases } from "@/lib/api/cases"
import { getReports } from "@/lib/api/reports"
import type { Reporte } from "@/lib/types/Report"
import type { Caso } from "@/lib/types/Case"
import { CASE_STATES } from "@/lib/types/Case"
import { useDetail } from "@/lib/utilities/useDetail"
import { useSelection } from "@/lib/utilities/useSelection"
import { isAdmin, useRole } from "@/lib/utilities/useRole"

/** Filter option that shows every case */
export const ALL_OPTION = 'Todos'

/** State whose cases an admin can select to delete them */
const DELETABLE_STATE = 'Cerrado'

/**
 * Lowercases a text and removes its accents for searching
 *
 * @param text - Text to normalize
 * @returns The normalized text
 */
const normalize = (text: string | null | undefined) => (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * View model of the cases list: filters by state, searches by id, colonia or calle, and counts the reports of each case
 *
 * @returns The visible cases, report counts, filter options with their setters, search text and loading flag, `reload` to fetch them again, `canSelect` (an admin looking at the closed cases), the `selection` of cases and `removeSelected`, which deletes the picked ones, drops the selection and reloads
 */
export const useCases = () => {
  const role = useRole()
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  // bumping it re-runs the effect, which reloads the lists
  const [version, setVersion] = useState(0)

  const [reports, setReports] = useState<Reporte[]>([])
  const [cases, setCases] = useState<Caso[]>([])

  /** Fetches the cases and reports again */
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    const getData = async () => {
      try {
        const [reports, cases] = await Promise.all([getReports(), getCases()])
        setReports(reports)
        setCases(cases)
      } catch (e) {
        console.error(`Error fetching reports and cases from api ${e}`)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [version])

  const filteredCases = useMemo(() => {
    const searchNorm = normalize(search.trim())

    return cases
    .filter( (c) =>  selectedFilter == ALL_OPTION || c.estado == selectedFilter )
    .filter( (c) => !searchNorm || 
    String(c.id_caso).includes(searchNorm) ||
    normalize(c.urgencia).includes(searchNorm) ||
    normalize(c.ubicacion.calle).includes(searchNorm) ||
    normalize(c.ubicacion.colonia).includes(searchNorm) ||
    normalize(c.ubicacion.municipio).includes(searchNorm))
    .sort( (first, second) => new Date(second.fecha_caso).getTime() - new Date(first.fecha_caso).getTime() )
  }, [cases, selectedFilter, search])

  const reportCounts = useMemo(() => {
    const counts = new Map<number, number>()
    reports.forEach((r) => {
      if (r.id_caso !== null) counts.set(r.id_caso, (counts.get(r.id_caso) ?? 0) + 1)
    })
    return counts
  }, [reports])

  const filterOptions = useMemo(
    () => [
      { value: ALL_OPTION, total: cases.length },
      ...CASE_STATES.map((state) => ({ value: state, total: cases.filter((c) => c.estado === state).length })),
    ],
    [cases],
  )

  const canSelect = isAdmin(role) && selectedFilter === DELETABLE_STATE
  const selection = useSelection(canSelect, filteredCases.map((c) => c.id_caso))

  /**
   * Deletes the picked cases, leaves the selection mode and reloads the list
   *
   * @returns The ids deleted and the ids skipped by the API
   */
  const removeSelected = async () => {
    const result = await deleteCases(selection.ids)
    selection.clear()
    reload()
    return result
  }

  return {
    cases: filteredCases,
    reportCounts,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    search,
    setSearch,
    loading,
    reload,
    canSelect,
    selection,
    removeSelected,
  }
}

export type { Mutate } from "@/lib/utilities/useDetail"

/**
 * Gets a case together with its reports
 *
 * @param id - Case id
 * @returns The case and its reports
 */
const fetchCase = async (id: number) => {
  const [caseElem, reports] = await Promise.all([getCase(id), getReports(id)])
  return { caseElem, reports }
}

/**
 * View model of one case page: the case, its reports and a way to change them
 *
 * @param id - Case id, as it comes from the route
 * @returns The case (undefined if missing), its reports, the loading flag and `mutate`, which runs an api call and reloads the data
 */
export const useCase = (id: number) => {
  const { data, loading, mutate } = useDetail(id, fetchCase)

  return {
    caseF: data?.caseElem,
    reports: data?.reports ?? [],
    loading,
    mutate,
  }
}
