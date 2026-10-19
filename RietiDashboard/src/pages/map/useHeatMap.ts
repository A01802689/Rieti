import { useEffect, useMemo, useState } from "react"
import type { option } from "./components/DropdownSelect"
import type { rangeType } from "./components/SliderControlled"
import { RISK_LEVELS, WORK_TYPES, MS_DAY, type Reporte, type ReportVisual } from "@/lib/types/Report"
import type { Caso, CaseVisual } from "@/lib/types/Case"
import type { Selected } from "@/lib/types/Selected"
import { isForbidden } from "@/lib/api/client"
import { getReports } from "@/lib/api/reports"
import { getCases } from "@/lib/api/cases"
import { dashboardHourAndWeekday, parseApiDate } from "@/lib/utilities/date"


/**
 * Turns a list of values into dropdown options
 *
 * @param values - Values that become label and value of each option
 * @returns The options, with ids starting at 1
 */
const toOptions = (values: readonly string[]): option[] =>
  values.map((v, i) => ({ id: i + 1, label: v, value: v }))

/** Range of the age slider as [min, max, step] */
export const AGE_RANGE: rangeType = [0, 18, 0.1]
/** Range of the days-unattended slider as [min, max, step] */
export const DAYS_RANGE: rangeType = [0, 365, 1]
/** Range of the work-hour slider as [min, max, step] */
export const HOUR_RANGE: rangeType = [0, 23, 1]

/** Options of the risk level filter */
export const RISK_OPTIONS = toOptions(RISK_LEVELS)
/** Options of the work type filter */
export const WORK_TYPE_OPTIONS = toOptions(WORK_TYPES)

/** Options of the weekday filter; the id is the weekday number (0 = sunday) */
export const WEEKDAY_OPTIONS: option[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  .map((day, i) => ({ id: i, label: day, value: day }))

/** Properties the reports can be colored by; `value` is the property used to color */
export const REPORT_VISUAL_OPTIONS: option[] = [
  { id: 1, label: "Nivel de riesgo", value: "risk" },
  { id: 2, label: "Niños, niñas y adolescentes", value: "nna" },
  { id: 3, label: "Edad aproximada", value: "approx_age" },
  { id: 4, label: "Días sin atender", value: "days_unattended" },
]

/** Properties the cases can be colored by */
export const CASE_VISUAL_OPTIONS: option[] = [
  { id: 1, label: "Urgencia", value: "urgency" },
  { id: 2, label: "Niños, niñas y adolescentes", value: "nna" },
  { id: 3, label: "Días transcurridos", value: "daysElapsed" },
]

/**
 * State of the reports layer visibility
 *
 * @param initial - Starting value
 * @returns The value and its setter
 */
export const useShowReports = (initial: boolean) => useState(initial)
/**
 * State of the cases layer visibility
 *
 * @param initial - Starting value
 * @returns The value and its setter
 */
export const useShowCases = (initial: boolean) => useState(initial)

/**
 * State of the property that colors the reports
 *
 * @param initial - Starting option
 * @returns The value and its setter
 */
export const useReportVisual = (initial?: option) => useState<option | undefined>(initial)
/**
 * State of the property that colors the cases
 *
 * @param initial - Starting option
 * @returns The value and its setter
 */
export const useCaseVisual = (initial?: option) => useState<option | undefined>(initial)

/**
 * State of the age range filter
 *
 * @param initial - [min, max]
 * @returns The value and its setter
 */
export const useAgeRange = (initial: number[]) => useState(initial)
/**
 * State of the days-unattended filter
 *
 * @param initial - [min, max]
 * @returns The value and its setter
 */
export const useDaysRange = (initial: number[]) => useState(initial)
/**
 * State of the work-hour filter
 *
 * @param initial - [min, max]
 * @returns The value and its setter
 */
export const useHourRange = (initial: number[]) => useState(initial)
/**
 * State of the risk level filter; empty means all
 *
 * @param initial - Starting options
 * @returns The value and its setter
 */
export const useRiskLevels = (initial: option[]) => useState(initial)
/**
 * State of the work type filter; empty means all
 *
 * @param initial - Starting options
 * @returns The value and its setter
 */
export const useWorkTypes = (initial: option[]) => useState(initial)
/**
 * State of the weekday filter; empty means all
 *
 * @param initial - Starting options
 * @returns The value and its setter
 */
export const useWeekdays = (initial: option[]) => useState(initial)

/**
 * State of the selected report or case
 *
 * @param initial - Starting selection
 * @returns The value and its setter
 */
export const useSelected = (initial: Selected | null) => useState(initial)

/** Values of every filter of the map */
export type HeatMapFilters = {
  ageRange: number[]
  daysRange: number[]
  hourRange: number[]
  riskLevels: option[]
  workTypes: option[]
  weekdays: option[]
}

/**
 * Tells if a range covers every value, so its filter is inactive
 *
 * @param range - Current [min, max]
 * @param full - Full range of the slider
 * @returns true when the filter is inactive
 */
const isFull = (range: number[], full: rangeType) => range[0] <= full[0] && range[1] >= full[1]

/**
 * Tells if an option with the given value is in the list
 *
 * @param list - Options to look in
 * @param value - Value to look for
 * @returns True when an option has that value
 */
const hasValue = (list: option[], value: unknown) => list.some((o) => o.value === value)

/** Age band, as [min, max], of each edad_aproximada */
const AGE_BANDS: Record<string, [number, number]> = {
  "0-5": [0, 5],
  "6-11": [6, 11],
  "12-14": [12, 14],
  "15-17": [15, 17],
}

/** Risk level that matches each case urgency, so the risk filter also applies to cases */
const URGENCY_TO_RISK = { Baja: "Bajo", Media: "Medio", Alta: "Alto" } as const

/**
 * Keeps the reports that pass every active filter
 *
 * @param reports - Reports to filter
 * @param f - Filter values
 * @param now - Date used to count the days unattended
 * @returns The reports that pass
 */
export const filterReports = (reports: Reporte[], f: HeatMapFilters, now: Date = new Date()): Reporte[] =>
  reports.filter((r) => {
    const date = parseApiDate(r.fecha_reporte)

    if (!isFull(f.ageRange, AGE_RANGE)) {
      // unknown ages are left out
      const band = r.edad_aproximada ? AGE_BANDS[r.edad_aproximada] : undefined
      if (!band || band[0] > f.ageRange[1] || band[1] < f.ageRange[0]) return false
    }

    if (!isFull(f.daysRange, DAYS_RANGE)) {
      // reports with a case are not unattended
      if (r.id_caso !== null) return false
      const days = Math.floor((now.getTime() - date.getTime()) / MS_DAY)
      if (days < f.daysRange[0] || days > f.daysRange[1]) return false
    }

    // the hour and the weekday are the ones of the dashboard time zone, the same the map points carry
    if (!isFull(f.hourRange, HOUR_RANGE)) {
      const { hour } = dashboardHourAndWeekday(date)
      if (hour < f.hourRange[0] || hour > f.hourRange[1]) return false
    }

    if (f.weekdays.length > 0) {
      const { weekday } = dashboardHourAndWeekday(date)
      if (!f.weekdays.some((o) => o.id === weekday)) return false
    }
    if (f.riskLevels.length > 0 && !hasValue(f.riskLevels, r.riesgo)) return false
    if (f.workTypes.length > 0 && !hasValue(f.workTypes, r.tipo_trabajo)) return false

    return true
  })

/**
 * Keeps the cases that pass the filters that apply to them (only the risk level)
 *
 * @param cases - Cases to filter
 * @param f - Filter values
 * @returns The cases that pass
 */
export const filterCases = (cases: Caso[], f: HeatMapFilters): Caso[] =>
  cases.filter((c) => {
    if (f.riskLevels.length > 0) {
      const risk = c.urgencia ? URGENCY_TO_RISK[c.urgencia] : null
      if (!hasValue(f.riskLevels, risk)) return false
    }
    return true
  })

/**
 * View model of the map page: fetches reports and cases once, keeps a copy and filters it
 *
 * @returns The loading flag, `forbidden` (the API refused to give the data), all and filtered reports and cases, every filter with its setter, the selected point and the color properties
 */
export const useHeatMap = () => {
  // keep a copy of the fetched data, the filters work over it
  const [allReports, setAllReports] = useState<Reporte[]>([])
  const [allCases, setAllCases] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [reportsArr, casesArr] = await Promise.all([getReports(), getCases()])
        if (cancelled) return
        setAllReports(reportsArr)
        setAllCases(casesArr)
      } catch (e) {
        console.error(`Error loading data ${e}`)
        if (!cancelled) setForbidden(isForbidden(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const [showReports, setShowReports] = useShowReports(true)
  const [showCases, setShowCases] = useShowCases(true)
  const [reportVisualOption, setReportVisualOption] = useReportVisual(REPORT_VISUAL_OPTIONS[0])
  const [caseVisualOption, setCaseVisualOption] = useCaseVisual(CASE_VISUAL_OPTIONS[0])
  const [ageRange, setAgeRange] = useAgeRange([AGE_RANGE[0], AGE_RANGE[1]])
  const [daysRange, setDaysRange] = useDaysRange([DAYS_RANGE[0], DAYS_RANGE[1]])
  const [hourRange, setHourRange] = useHourRange([HOUR_RANGE[0], HOUR_RANGE[1]])
  const [riskLevels, setRiskLevels] = useRiskLevels([])
  const [workTypes, setWorkTypes] = useWorkTypes([])
  const [weekdays, setWeekdays] = useWeekdays([])
  const [selected, setSelected] = useSelected(null)

  const reports = useMemo(
    () => filterReports(allReports, { ageRange, daysRange, hourRange, riskLevels, workTypes, weekdays }),
    [allReports, ageRange, daysRange, hourRange, riskLevels, workTypes, weekdays],
  )
  const cases = useMemo(
    () => filterCases(allCases, { ageRange, daysRange, hourRange, riskLevels, workTypes, weekdays }),
    [allCases, ageRange, daysRange, hourRange, riskLevels, workTypes, weekdays],
  )

  // fall back to the default scheme when nothing is chosen
  const reportVisual = (reportVisualOption?.value ?? "risk") as ReportVisual
  const caseVisual = (caseVisualOption?.value ?? "urgency") as CaseVisual

  return {
    loading,
    forbidden,
    allReports, allCases,
    reports, cases,
    showReports, setShowReports,
    showCases, setShowCases,
    reportVisualOption, setReportVisualOption, reportVisual,
    caseVisualOption, setCaseVisualOption, caseVisual,
    ageRange, setAgeRange,
    daysRange, setDaysRange,
    hourRange, setHourRange,
    riskLevels, setRiskLevels,
    workTypes, setWorkTypes,
    weekdays, setWeekdays,
    selected, setSelected,
  }
}

/** Shape of the view model returned by useHeatMap */
export type HeatMapState = ReturnType<typeof useHeatMap>
