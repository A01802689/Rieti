import { useEffect, useMemo, useState } from 'react'
import { isForbidden } from '@/lib/api/client'
import { getCases } from '@/lib/api/cases'
import { REPORT_STATUS, type Reporte } from '@/lib/types/Report'
import { CASE_STATES, type Caso } from '@/lib/types/Case'
import { getReports } from '@/lib/api/reports'
import { dashboardYearAndMonth, parseApiDate } from '@/lib/utilities/date'

/** Month names of the chart axis */
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
/** Number of months drawn in the cases chart */
const GRAPH_MONTHS = 6

/**
 * Numbers of the home page, computed from the cases and reports data
 *
 * The months are those of Mexico City time, so a case created late at night counts in the month it was created there
 *
 * @param now - Current date, which sets the last month of the chart
 * @returns The KPI cards, the points of the "cases per month" chart, the totals per status, the loading flag and `forbidden` (the API refused to give the data)
 */
export const useHome = (now: Date = new Date()) => {
  const [cases, setCases] = useState<Caso[]>([])
  const [reports, setReports] = useState<Reporte[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    const getData = async () => {
      try {
        const [reports, cases] = await Promise.all([getReports(), getCases()])
        setReports(reports)
        setCases(cases)
      } catch (e) {
        console.error(`Error fetching reports and cases from api ${e}`)
        setForbidden(isForbidden(e))
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [])

  // only the month matters to the chart, so a new Date on every render does not recompute the memo
  const { year: currentYear, month: currentMonth } = dashboardYearAndMonth(now)

  const data = useMemo(() => {
      const stats = [
        { label: 'Casos', value: String(cases.length), note: 'registrados', tone: 'bg-amber-500' },
        { label: 'Reportes recibidos', value: String(reports.length), note: 'en total', tone: 'bg-teal-600' },
        {
          label: 'Casos cerrados',
          value: String(cases.filter((c) => c.estado === 'Cerrado').length),
          note: 'Con restitución de derechos',
          tone: 'bg-emerald-600',
        },
        {
          label: 'Reportes canalizados',
          value: String(reports.filter((r) => r.id_caso !== null).length),
          note: 'asignados a un caso',
          tone: 'bg-blue-600',
        },
      ]

      // cases per month, keyed by year * 12 + month so the months of different years do not mix
      const casesPerMonth = new Map<number, number>()
      for (const c of cases) {
        const { year, month } = dashboardYearAndMonth(parseApiDate(c.fecha_caso))
        const monthKey = year * 12 + month
        casesPerMonth.set(monthKey, (casesPerMonth.get(monthKey) ?? 0) + 1)
      }

      // last GRAPH_MONTHS months ending at the current one
      const graphData = Array.from({ length: GRAPH_MONTHS }, (_, i) => {
        const monthKey = currentYear * 12 + currentMonth - (GRAPH_MONTHS - 1 - i)
        const year = Math.floor(monthKey / 12)
        const month = monthKey % 12
        const name = year === currentYear ? MONTHS[month] : `${MONTHS[month]} ${year}`
        return { name, value: casesPerMonth.get(monthKey) ?? 0 }
      })

      const caseStatus = CASE_STATES.map((value) => ({ value, total: cases.filter((c) => c.estado === value).length }))
      const reportStatus = REPORT_STATUS.map((value) => ({
        value,
        total: reports.filter((r) => r.estatus_seguimiento === value).length,
      }))

      return { stats, graphData, caseStatus, reportStatus }
    }, [cases, reports, currentYear, currentMonth])

  return { ...data, loading, forbidden }
}
