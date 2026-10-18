import { useNavigate, useParams } from 'react-router-dom'
import { DetailLayout } from '@/components/layout/DetailLayout'
import { ReportDetails } from '@/components/ui/ReportDetails'
import { RISK_LEVEL_STYLES, formatDateTime, statusStyle } from '@/lib/utilities/reportStyles'
import { ReportActions } from './components/ReportActions'
import { useReport } from './useReports'

/** Page of one report (id from the URL): header with its status and risk, every field with map and photo, and the triage actions */
const ReportDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { report, loading, reload } = useReport(Number(id))
    const style = statusStyle(report?.estatus_seguimiento)

    return (
        <DetailLayout loading={loading} found={!!report} notFound="Reporte no encontrado" backTo="/reports">
            {report && (
                <div className="flex flex-col gap-4 sm:gap-6">
                    <header className="flex flex-col gap-4 rounded-xl border border-card bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <button type="button" onClick={() => navigate('/reports')} className="text-sm font-diffuse hover:underline">
                                ← Volver
                            </button>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                                <h1 className="p-0 text-2xl font-semibold sm:text-3xl">{report.folio_reporte}</h1>
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                                    {report.estatus_seguimiento ?? 'Sin estatus'}
                                </span>
                                <span
                                    className={`text-sm font-medium ${
                                        report.riesgo ? RISK_LEVEL_STYLES[report.riesgo] ?? 'font-diffuse' : 'font-diffuse'
                                    }`}
                                >
                                    {report.riesgo ? `Riesgo ${report.riesgo.toLowerCase()}` : 'Riesgo sin evaluar'}
                                </span>
                            </div>
                            <p className="font-sight p-0 pt-1">
                                {report.ubicacion.colonia} · {formatDateTime(report.fecha_reporte)}
                            </p>
                        </div>

                        {report.id_caso !== null && (
                            <button
                                type="button"
                                onClick={() => navigate(`/cases/${report.id_caso}`)}
                                className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
                            >
                                Ver caso #{report.id_caso} →
                            </button>
                        )}
                    </header>

                    <section className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm sm:p-6">
                        <ReportDetails report={report} />
                        <ReportActions
                            report={report}
                            onAccepted={(caseId) => navigate(`/cases/${caseId}`)}
                            onChanged={reload}
                        />
                    </section>
                </div>
            )}
        </DetailLayout>
    )
}

export default ReportDetailPage
