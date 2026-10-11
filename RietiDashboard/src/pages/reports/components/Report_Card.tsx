import { useState } from 'react';
import type { Reporte } from '../../../lib/types/Report';
import { ReportDetails } from '@/components/ui/ReportDetails';
import {
    RISK_LEVEL_STYLES,
    formatDateTime,
    formatMinorDetails,
    isUnknown,
    statusStyle,
} from '@/lib/utilities/reportStyles';
import { ReportActions } from './ReportActions';

const iconClass = 'mt-0.5 h-4 w-4 shrink-0 font-diffuse';
const labelClass = 'font-semibold';

interface Props {
    /** Report shown */
    report: Reporte;
    /** Called with the id of the case created when the report is accepted */
    onCaseCreated: (caseId: number) => void;
}

/** Card of a report with its summary, an expandable detail and the triage actions */
export function ReportCard({ report, onCaseCreated }: Props) {
    const [expanded, setExpanded] = useState(false);
    const style = statusStyle(report.estatus_seguimiento);
    const detailsId = `report-details-${report.id_reporte}`;

    return (
        <article className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-mono text-lg font-bold font-accent">{report.folio_reporte}</h2>
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                            {report.estatus_seguimiento ?? 'Sin estatus'}
                        </span>
                        {!isUnknown(report.tipo_trabajo) && (
                            <span className="rounded-full bg-component px-3 py-1 text-sm font-diffuse">
                                {report.tipo_trabajo}
                            </span>
                        )}
                        <span
                            className={`text-sm font-medium ${
                                report.riesgo ? RISK_LEVEL_STYLES[report.riesgo] ?? 'font-diffuse' : 'font-diffuse'
                            }`}
                        >
                            {report.riesgo ? `Riesgo ${report.riesgo.toLowerCase()}` : 'Riesgo sin evaluar'}
                        </span>
                    </div>

                    <p className="mt-3 font-semibold">
                        {report.ubicacion.colonia} · {formatDateTime(report.fecha_reporte)}
                    </p>

                    {!expanded && (
                        <div className="mt-3 space-y-2 text-sm">
                            <p className="flex gap-2">
                                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                    <path d="M8 10h8M8 14h8" />
                                </svg>
                                <span>
                                    <strong className={labelClass}>Descripción:</strong>{' '}
                                    {report.descripcion ?? <em className="font-diffuse">Sin descripción</em>}
                                </span>
                            </p>
                            <p className="flex gap-2">
                                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                                    <circle cx="9" cy="8" r="3" />
                                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.6-4.8-4-5.6" />
                                </svg>
                                <span>
                                    <strong className={labelClass}>Menores:</strong>{' '}
                                    {formatMinorDetails(report.cantidad_nna, report.edad_aproximada)}
                                    <span className="font-diffuse"> · </span>
                                    {report.id_usuario === null
                                        ? 'Reporte anónimo'
                                        : `Reportado por usuario #${report.id_usuario}`}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        {expanded ? 'Ocultar detalle ↑' : 'Detalle ↓'}
                    </button>
                </div>
            </div>

            {expanded && (
                <div id={detailsId} className="flex flex-col gap-4 border-t border-card pt-4">
                    <ReportDetails report={report} />
                    <ReportActions report={report} onAccepted={onCaseCreated} />
                </div>
            )}
        </article>
    );
}
