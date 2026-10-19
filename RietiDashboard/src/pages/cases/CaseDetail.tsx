import { ListIcon } from './components/CaseIcons'
import { useParams } from 'react-router-dom'
import { CaseHeader } from './components/CaseHeader'
import { CaseDataCard, Card, ReporterCard } from './components/CaseInfo'
import { CaseEditCard } from './components/CaseEditCard'
import { CaseLocationCard } from './components/CaseLocationCard'
import { CaseTimeline } from './components/CaseTimeline'
import { AddNoteCard, MetadataCard } from './components/CaseSidePanel'
import { CaseReportItem } from './components/CaseReportItem'
import { useCase } from './useCases'
import { DetailLayout } from '@/components/layout/DetailLayout'
import { useAuth } from '@/context/auth'

/** Page of one case (id from the URL): header, reporter, editable classification and location, case data, timeline, its reports and the side panel; the note card and every control that changes something need their permissions */
const CaseDetailPage = () => {
    const { id } = useParams()
    const { can } = useAuth()
    const { caseF, reports, loading, forbidden, error, reload, mutate, saveChanges, update } = useCase(Number(id))

    return (
        <DetailLayout loading={loading} found={!!caseF} forbidden={forbidden} error={error} onRetry={reload} notFound="Caso no encontrado" backTo="/cases">
            {caseF && (
                <div className="flex flex-col gap-4 sm:gap-6">
                    <CaseHeader caso={caseF} firstReport={reports[0]} mutate={mutate} update={update} />

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                        <div className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:col-span-2">
                            <ReporterCard reports={reports} />
                            <CaseEditCard caso={caseF} saveChanges={saveChanges} />
                            <CaseLocationCard caso={caseF} update={update} />
                            <CaseDataCard caso={caseF} reports={reports} />
                            <CaseTimeline caso={caseF} />
                        </div>

                        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
                            {can('cases.edit') && <AddNoteCard caso={caseF} mutate={mutate} />}
                            <MetadataCard caso={caseF} reports={reports} />
                            <Card title="Reportes del caso" icon={<ListIcon />} tone="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                {reports.length === 0 ? (
                                    <p className="p-0 font-diffuse">Sin reportes asociados.</p>
                                ) : (
                                    reports.map((r) => <CaseReportItem key={r.id_reporte} report={r} mutate={mutate} />)
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </DetailLayout>
    )
}

export default CaseDetailPage
