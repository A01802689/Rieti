import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/context/auth"
import { isForbidden } from "@/lib/api/client"
import { addNote2Case, deleteCases, getCase, getCases, updateCase } from "@/lib/api/cases"
import { getReports } from "@/lib/api/reports"
import type { Caso, CasoPatch } from "@/lib/types/Case"
import { CASE_STATES } from "@/lib/types/Case"
import { parseApiDate } from "@/lib/utilities/date"
import { useDetail } from "@/lib/utilities/useDetail"
import { useSelection } from "@/lib/utilities/useSelection"
import { normalizeText } from "@/lib/utilities/text"
import { ALL_OPTION } from "@/lib/utilities/filters"

/** State whose cases an admin can select to delete them */
const DELETABLE_STATE = 'Cerrado'

/**
 * View model of the cases list: filters by state and searches by id, colonia or calle; every case brings its number of reports
 *
 * @returns The visible cases, filter options with their setters, search text, loading flag, `forbidden` (the API refused to list the cases), `reload` to fetch them again, `canSelect` (an admin looking at the closed cases), the `selection` of cases and `removeSelected`, which deletes the picked ones, drops the selection and reloads
 */
export const useCases = () => {
  const { isAdmin } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState<string>(ALL_OPTION)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [forbidden, setForbidden] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  // bumping it re-runs the effect, which reloads the list
  const [version, setVersion] = useState(0)

  const [cases, setCases] = useState<Caso[]>([])

  /** Fetches the cases again */
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    let stale = false
    const getData = async () => {
      try {
        const cases = await getCases()
        if (stale) return
        setCases(cases)
        setForbidden(false)
        setLoadFailed(false)
      } catch (e) {
        console.error(`Error fetching cases from api ${e}`)
        if (stale) return
        setCases([])
        setForbidden(isForbidden(e))
        setLoadFailed(!isForbidden(e))
      } finally {
        if (!stale) setLoading(false)
      }
    }

    getData()
    return () => { stale = true }
  }, [version])

  const filteredCases = useMemo(() => {
    const searchNorm = normalizeText(search.trim())

    return cases
    .filter( (c) =>  selectedFilter == ALL_OPTION || c.estado == selectedFilter )
    .filter( (c) => !searchNorm || 
    String(c.id_caso).includes(searchNorm) ||
    normalizeText(c.urgencia).includes(searchNorm) ||
    normalizeText(c.ubicacion.calle).includes(searchNorm) ||
    normalizeText(c.ubicacion.colonia).includes(searchNorm) ||
    normalizeText(c.ubicacion.municipio).includes(searchNorm))
    .sort( (first, second) => parseApiDate(second.fecha_caso).getTime() - parseApiDate(first.fecha_caso).getTime() )
  }, [cases, selectedFilter, search])

  const filterOptions = useMemo(
    () => [
      { value: ALL_OPTION, total: cases.length },
      ...CASE_STATES.map((state) => ({ value: state, total: cases.filter((c) => c.estado === state).length })),
    ],
    [cases],
  )

  const canSelect = isAdmin && selectedFilter === DELETABLE_STATE
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
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    search,
    setSearch,
    loading,
    forbidden,
    loadFailed,
    reload,
    canSelect,
    selection,
    removeSelected,
  }
}

export type { Mutate } from "@/lib/utilities/useDetail"

/** What the edit form of a case saves */
export interface CaseChanges {
  /** Fields of the case that changed; empty when only a note is saved */
  patch: CasoPatch
  /** Text of a new note; null when there is none */
  nota: string | null
}

/** Saves the changes of the edit form of a case and reloads it once; if something fails it throws an error with a message for the user */
export type SaveChanges = (changes: CaseChanges) => Promise<void>

/** Applies one change to the case and reloads it; if it fails it throws the error of the api */
export type UpdateCase = (patch: CasoPatch) => Promise<void>

/**
 * Reads the message of an error
 *
 * @param e - Value thrown by an api call
 * @returns The error message, or a generic one when the value is not an Error
 */
const messageOf = (e: unknown) => (e instanceof Error ? e.message : "error desconocido")

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
 * View model of one case page: the case, its reports and the ways to change them
 *
 * @param id - Case id, as it comes from the route
 * @returns The case (undefined if missing), its reports, the loading flag, `forbidden` (the API refused to show it), `mutate` (runs an api call and reloads the data), `saveChanges` (batch save of the edit form) and `update` (one change)
 */
export const useCase = (id: number) => {
  const { data, loading, forbidden, error, reload, mutate } = useDetail(id, fetchCase)

  /**
   * Saves the form of a case: one PATCH with only what changed (if anything) and then the note (if there is one), with a single reload at the end
   *
   * @param changes - `patch` with the fields that changed and `nota` with the text of the new note (null when there is none)
   * @throws Error saying which part failed, e.g. that the data was saved but the note was not
   */
  const saveChanges: SaveChanges = ({ patch, nota }) =>
    mutate(async () => {
      const hasPatch = Object.keys(patch).length > 0
      if (hasPatch) {
        try {
          await updateCase(id, patch)
        } catch (e) {
          throw new Error(`No se pudieron guardar los datos: ${messageOf(e)}`)
        }
      }
      if (nota !== null) {
        try {
          await addNote2Case(id, nota)
        } catch (e) {
          throw new Error(`${hasPatch ? "Los datos se guardaron, pero no" : "No"} se pudo agregar la nota: ${messageOf(e)}`)
        }
      }
    })

  /**
   * Applies one change to the case, e.g. its state chosen in the header or its location
   *
   * @param patch - Fields to change
   */
  const update: UpdateCase = (patch) => mutate(() => updateCase(id, patch))

  return {
    caseF: data?.caseElem,
    reports: data?.reports ?? [],
    loading,
    forbidden,
    error,
    reload,
    mutate,
    saveChanges,
    update,
  }
}
