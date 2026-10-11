// custom hook (works as a vm): fetch reports and cases, keep a copy and filter it
import { useEffect, useMemo, useState } from "react"
import type { option } from "@/components/ui/DropdownSelect"
import type { rangeType } from "@/components/ui/SliderControlled"
import { RISK_LEVELS, WORK_TYPES, MS_DAY, type Reporte, type ReportVisual } from "@/lib/types/Report"
import type { Caso, CaseVisual } from "@/lib/types/Case"
import type { Selected } from "@/lib/types/Selected"
import { getReports } from "@/lib/api/reports"
import { getCases } from "@/lib/api/cases"


// build options from a list of values
/**
 * Turns a list of values into dropdown options
 *
 * @param values - Values that become label and value of each option
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

// use the weekday number as id (0 = sunday)
export const WEEKDAY_OPTIONS: option[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  .map((day, i) => ({ id: i, label: day, value: day }))

// value is the property used to color
/** Properties the reports can be colored by */
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

// Filter states:  hook / filter 

// choose the visible layers
/**
 * State of the reports layer visibility
 *
 * @param initial - Starting value
 */
export const useShowReports = (initial: boolean) => useState(initial)
/**
 * State of the cases layer visibility
 *
 * @param initial - Starting value
 */
export const useShowCases = (initial: boolean) => useState(initial)

// choose the color schemes
/**
 * State of the property that colors the reports
 *
 * @param initial - Starting option
 */
export const useReportVisual = (initial?: option) => useState<option | undefined>(initial)
/**
 * State of the property that colors the cases
 *
 * @param initial - Starting option
 */
export const useCaseVisual = (initial?: option) => useState<option | undefined>(initial)

// store the filter values
/**
 * State of the age range filter
 *
 * @param initial - [min, max]
 */
export const useAgeRange = (initial: number[]) => useState(initial)
/**
 * State of the days-unattended filter
 *
 * @param initial - [min, max]
 */
export const useDaysRange = (initial: number[]) => useState(initial)
/**
 * State of the work-hour filter
 *
 * @param initial - [min, max]
 */
export const useHourRange = (initial: number[]) => useState(initial)
/**
 * State of the risk level filter; empty means all
 *
 * @param initial - Starting options
 */
export const useRiskLevels = (initial: option[]) => useState(initial)
/**
 * State of the work type filter; empty means all
 *
 * @param initial - Starting options
 */
export const useWorkTypes = (initial: option[]) => useState(initial)
/**
 * State of the weekday filter; empty means all
 *
 * @param initial - Starting options
 */
export const useWeekdays = (initial: option[]) => useState(initial)

// keep the selected report or case
/**
 * State of the selected report or case
 *
 * @param initial - Starting selection
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

// a range is inactive when it covers all the values
/**
 * Tells if a range covers every value, so its filter is inactive
 *
 * @param range - Current [min, max]
 * @param full - Full range of the slider
 */
const isFull = (range: number[], full: rangeType) => range[0] <= full[0] && range[1] >= full[1]

const hasValue = (list: option[], value: unknown) => list.some((o) => o.value === value)

// age bands of edad_aproximada
const AGE_BANDS: Record<string, [number, number]> = {
  "0-5": [0, 5],
  "6-11": [6, 11],
  "12-14": [12, 14],
  "15-17": [15, 17],
}

const URGENCY_TO_RISK = { Baja: "Bajo", Media: "Medio", Alta: "Alto" } as const

// filter the reports with every active filter
/**
 * Keeps the reports that pass every active filter
 *
 * @param reports - Reports to filter
 * @param f - Filter values
 * @param now - Date used to count the days unattended
 */
export const filterReports = (reports: Reporte[], f: HeatMapFilters, now: Date = new Date()): Reporte[] =>
  reports.filter((r) => {
    const date = new Date(r.fecha_reporte)

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

    if (!isFull(f.hourRange, HOUR_RANGE)) {
      const hour = date.getHours()
      if (hour < f.hourRange[0] || hour > f.hourRange[1]) return false
    }

    if (f.weekdays.length > 0 && !f.weekdays.some((o) => o.id === date.getDay())) return false
    if (f.riskLevels.length > 0 && !hasValue(f.riskLevels, r.riesgo)) return false
    if (f.workTypes.length > 0 && !hasValue(f.workTypes, r.tipo_trabajo)) return false

    return true
  })

// filter the cases (only the risk level applies to them)
/**
 * Keeps the cases that pass the filters that apply to them (only the risk level)
 *
 * @param cases - Cases to filter
 * @param f - Filter values
 */
export const filterCases = (cases: Caso[], f: HeatMapFilters): Caso[] =>
  cases.filter((c) => {
    if (f.riskLevels.length > 0) {
      const risk = c.urgencia ? URGENCY_TO_RISK[c.urgencia] : null
      if (!hasValue(f.riskLevels, risk)) return false
    }
    return true
  })

// ---------- View model ----------

/**
 * View model of the map page: fetches reports and cases once, keeps a copy and filters it
 *
 * @returns The loading flag, all and filtered reports and cases, every filter with its setter, the selected point and the color properties
 */
export const useHeatMap = () => {
  // keep a copy of the fetched data, the filters work over it
  const [allReports, setAllReports] = useState<Reporte[]>([])
  const [allCases, setAllCases] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)

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

  // apply the filters over the copies
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

export type HeatMapState = ReturnType<typeof useHeatMap>
