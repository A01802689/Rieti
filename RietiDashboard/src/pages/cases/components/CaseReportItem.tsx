import type { ReportState, Reporte } from '@/lib/types/Report'
import { ReportDetails } from '@/components/ui/ReportDetails'
import { changeReportState, unlinkReport } from '@/lib/api/reports'
import { useAuth } from '@/context/auth'
import { statusStyle } from '@/lib/utilities/reportStyles'
import { useAction } from '@/lib/utilities/useAction'
import type { Mutate } from '../useCases'

/** Statuses a report of a case can move through, each with the permission that moving the report there needs: Concluido closes the report */
const FOLLOW_UP: { state: ReportState; permission: 'reports.edit' | 'reports.close' }[] = [
    { state: 'Canalizado', permission: 'reports.edit' },
    { state: 'En atención', permission: 'reports.edit' },
    { state: 'Concluido', permission: 'reports.close' },
]

/**
 * Report that belongs to the case, with its full data and the follow-up controls; the follow-up select and the unlink button need the permissions to edit or close reports
 *
 * @param report - Report shown
 * @param mutate - Runs the api call and reloads the case
 */
export function CaseReportItem({ report, mutate }: { report: Reporte; mutate: Mutate }) {
    const { isAdmin, can, canAny } = useAuth()
    const { busy, error, run } = useAction()
    const style = statusStyle(report.estatus_seguimiento)
    // taking a report out of "Rechazado" is for admins only, whatever the status it moves to
    const canFollowUp = canAny('reports.edit', 'reports.close') && (isAdmin || report.estatus_seguimiento !== 'Rechazado')

    return (
        <article className="flex flex-col gap-4 rounded-xl bg-component p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-mono text-base font-bold font-accent">{report.folio_reporte}</h3>
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                    {report.estatus_seguimiento ?? 'Sin estatus'}
                </span>
            </div>

            <ReportDetails report={report} withMap={false} />

            <div className="flex flex-col gap-2 border-t border-card pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <label htmlFor={`status-${report.id_reporte}`} className="text-sm font-semibold font-clear">
                        Seguimiento
                    </label>
                    <select
                        id={`status-${report.id_reporte}`}
                        value={report.estatus_seguimiento ?? ''}
                        disabled={busy || !canFollowUp}
                        title={canFollowUp ? undefined : 'No tienes permiso para cambiar el seguimiento de este reporte'}
                        onChange={(e) => run(() => mutate(() => changeReportState(report.id_reporte, e.target.value as ReportState)))}
                        className="select-field w-auto"
                    >
                        {report.estatus_seguimiento && !FOLLOW_UP.some(({ state }) => state === report.estatus_seguimiento) && (
                            <option value={report.estatus_seguimiento}>{report.estatus_seguimiento}</option>
                        )}
                        {FOLLOW_UP.map(({ state, permission }) => (
                            <option key={state} value={state} disabled={!can(permission)}>
                                {state}
                            </option>
                        ))}
                    </select>
                </div>

                {can('reports.edit') && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => mutate(() => unlinkReport(report.id_reporte)))}
                        className="btn-danger rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Desvincular del caso
                    </button>
                )}
            </div>

            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </article>
    )
}
