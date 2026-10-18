import { useEffect, useState } from 'react'
import { isForbidden } from '@/lib/api/client'
import { getLogs } from '@/lib/api/logs'
import { ENTITY_LABELS, ENTITY_TYPES, type EntityType, type Log, type LogsQuery } from '@/lib/types/Log'
import { useDebouncedValue } from '@/lib/utilities/useDebouncedValue'
import { ALL_OPTION } from '@/lib/utilities/filters'

/** Value of a filter button: a kind of record, or ALL_OPTION for no filter */
export type LogFilter = EntityType | typeof ALL_OPTION

/** Number of logs asked to the API on every request */
const PAGE_SIZE = 100

/** Milliseconds the search box must stay unchanged before the API is asked */
const SEARCH_DELAY_MS = 350

/** Filter buttons, in the order they are shown */
const FILTER_OPTIONS: { value: LogFilter; label: string }[] = [
  { value: ALL_OPTION, label: ALL_OPTION },
  ...ENTITY_TYPES.map((entity) => ({ value: entity, label: ENTITY_LABELS[entity] })),
]

/** Logs loaded for one filter and search; both tell which request they answer, so the answer of an old one is never mixed with the current one */
interface LogsPage {
  filter: LogFilter
  /** Text the API searched, without the spaces around it */
  search: string
  logs: Log[]
  /** Whether the API may have more logs after the loaded ones */
  hasMore: boolean
  /** Whether the last request failed */
  failed: boolean
  /** Whether the last request failed because the user may not see the logs */
  forbidden: boolean
}

/**
 * Builds the API query of a page of logs
 *
 * @param filter - Filter button selected
 * @param search - Text to search, without the spaces around it
 * @param skip - Number of logs already loaded
 * @returns The query to send to the API
 */
const buildQuery = (filter: LogFilter, search: string, skip: number): LogsQuery => ({
  entity_type: filter === ALL_OPTION ? undefined : filter,
  buscar: search || undefined,
  limite: PAGE_SIZE,
  desplazamiento: skip,
})

/**
 * View model of the logs list: the API filters by kind of record, searches the text, pages the results and keeps the newest first
 *
 * The search waits until the user stops typing and starts again from the first page
 *
 * @returns The logs loaded, loading and error flags, `forbidden` (the API refused to give the logs), `loadMore` to get the next page, filter options with their setter, search text with its setter and the expanded row with its toggle
 */
export function useLogs() {
  const [selectedFilter, setSelectedFilter] = useState<LogFilter>(ALL_OPTION)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState<LogsPage | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // spaces around the text do not change the search
  const search = useDebouncedValue(searchQuery, SEARCH_DELAY_MS).trim()

  useEffect(() => {
    // a late answer of a previous filter or search is ignored
    let ignore = false

    const getData = async () => {
      try {
        const logs = await getLogs(buildQuery(selectedFilter, search, 0))
        if (!ignore) setPage({ filter: selectedFilter, search, logs, hasMore: logs.length === PAGE_SIZE, failed: false, forbidden: false })
      } catch (e) {
        console.error(`Error fetching logs from api ${e}`)
        if (!ignore) setPage({ filter: selectedFilter, search, logs: [], hasMore: false, failed: true, forbidden: isForbidden(e) })
      }
    }

    getData()
    return () => {
      ignore = true
    }
  }, [selectedFilter, search])

  // until the current filter and search have an answer, the view shows the loading state
  const loaded = page && page.filter === selectedFilter && page.search === search ? page : null

  /**
   * Selects a filter button and collapses the open row
   *
   * @param filter - Filter to apply
   */
  const selectFilter = (filter: LogFilter) => {
    setSelectedFilter(filter)
    setExpandedId(null)
  }

  /**
   * Sets the text of the search box and collapses the open row
   *
   * @param value - New text of the search box
   */
  const changeSearch = (value: string) => {
    setSearchQuery(value)
    setExpandedId(null)
  }

  /**
   * Expands the detail of a log, or collapses it when it is already open
   *
   * @param id - Id of the log
   */
  const toggleExpanded = (id: number) => setExpandedId((current) => (current === id ? null : id))

  /** Asks for the next page and adds it after the loaded logs */
  const loadMore = async () => {
    if (!loaded || loadingMore) return
    const { filter, search: pageSearch, logs: current } = loaded
    setLoadingMore(true)
    try {
      const next = await getLogs(buildQuery(filter, pageSearch, current.length))
      setPage((prev) => {
        if (!prev || prev.filter !== filter || prev.search !== pageSearch) return prev
        // new logs written meanwhile shift the pages, so a log already loaded is skipped
        const known = new Set(prev.logs.map((l) => l.id_logs))
        return {
          filter,
          search: pageSearch,
          logs: [...prev.logs, ...next.filter((l) => !known.has(l.id_logs))],
          hasMore: next.length === PAGE_SIZE,
          failed: false,
          forbidden: false,
        }
      })
    } catch (e) {
      console.error(`Error fetching more logs from api ${e}`)
      setPage((prev) =>
        prev && prev.filter === filter && prev.search === pageSearch ? { ...prev, failed: true, forbidden: isForbidden(e) } : prev,
      )
    } finally {
      setLoadingMore(false)
    }
  }

  return {
    logs: loaded?.logs ?? [],
    loading: loaded === null,
    loadingMore,
    hasMore: loaded?.hasMore ?? false,
    error: loaded?.failed ?? false,
    forbidden: loaded?.forbidden ?? false,
    loadMore,
    filterOptions: FILTER_OPTIONS,
    selectedFilter,
    setSelectedFilter: selectFilter,
    searchQuery,
    setSearchQuery: changeSearch,
    expandedId,
    toggleExpanded,
  }
}
