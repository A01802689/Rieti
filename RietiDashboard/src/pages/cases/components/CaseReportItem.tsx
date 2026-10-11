import type { EstatusSeguimiento, Reporte } from '@/lib/types/Report';
import { ReportDetails } from '@/components/ui/ReportDetails';
import { detachReport, setReportStatus } from '@/lib/api/workflow';
import { statusStyle } from '@/lib/utilities/reportStyles';
import { isAdmin, useRole } from '@/lib/utilities/useRole';

/** Statuses a report of a case can move through */
const FOLLOW_UP: EstatusSeguimiento[] = ['Canalizado', 'En atención', 'Concluido'];

/**
 * Report that belongs to the case, with its full data and the follow-up controls
 *
 * @param report - Report shown
 */
export function CaseReportItem({ report }: { report: Reporte }) {
    const role = useRole();
    const style = statusStyle(report.estatus_seguimiento);

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

            <div className="flex flex-col gap-2 border-t border-card pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <label htmlFor={`status-${report.id_reporte}`} className="text-sm font-semibold font-clear">
                        Seguimiento
                    </label>
                    <select
                        id={`status-${report.id_reporte}`}
                        value={report.estatus_seguimiento ?? ''}
                        onChange={(e) => setReportStatus(report.id_reporte, e.target.value as EstatusSeguimiento)}
                        className="select-field w-auto"
                    >
                        {report.estatus_seguimiento && !FOLLOW_UP.includes(report.estatus_seguimiento) && (
                            <option value={report.estatus_seguimiento}>{report.estatus_seguimiento}</option>
                        )}
                        {FOLLOW_UP.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                {isAdmin(role) && (
                    <button
                        type="button"
                        onClick={() => detachReport(report.id_reporte)}
                        className="btn-danger rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Desvincular del caso
                    </button>
                )}
            </div>
        </article>
    );
}
