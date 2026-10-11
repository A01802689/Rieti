import { ListIcon } from './components/CaseIcons';
import SideBar from '../../components/ui/SideBar';
import { useNavigate, useParams } from 'react-router-dom';
import { CaseHeader } from './components/CaseHeader';
import { CaseDataCard, Card, ReporterCard } from './components/CaseInfo';
import { CaseTimeline } from './components/CaseTimeline';
import { AddNoteCard, MetadataCard } from './components/CaseSidePanel';
import { CaseReportItem } from './components/CaseReportItem';
import { useCaseDetail } from '@/lib/VM/Usecases';

/** Page of one case (id from the URL): header, reporter and case data, timeline, its reports and the side panel */
const CaseDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { caso, reports } = useCaseDetail(Number(id));

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="min-h-screen p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                {caso ? (
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <CaseHeader caso={caso} firstReport={reports[0]} />

                        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                            <div className="flex min-w-0 flex-col gap-4 sm:gap-6 xl:col-span-2">
                                <ReporterCard reports={reports} />
                                <CaseDataCard caso={caso} reports={reports} />
                                <CaseTimeline caso={caso} />
                            </div>

                            <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
                                <AddNoteCard caso={caso} />
                                <MetadataCard caso={caso} reports={reports} />
                                <Card title="Reportes del caso" icon={<ListIcon />} tone="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                    {reports.length === 0 ? (
                                        <p className="p-0 font-diffuse">Sin reportes asociados.</p>
                                    ) : (
                                        reports.map((r) => <CaseReportItem key={r.id_reporte} report={r} />)
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    <header className="rounded-xl bg-card px-5 py-5 shadow-sm sm:px-8 sm:py-6">
                        <button type="button" onClick={() => navigate('/case')} className="btn-secondary mb-3 rounded-lg px-3 py-1.5 text-sm">
                            ← Volver
                        </button>
                        <h1>Caso no encontrado</h1>
                    </header>
                )}
            </div>
        </div>
    );
};

export default CaseDetailPage;
