import SideBar from '../../components/ui/SideBar';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from './components/Report_Card';
import { useReportsViewModel } from '@/lib/VM/Usereportescm';

const ReportPage = () => {
    const navigate = useNavigate();
    const vm = useReportsViewModel();

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="min-h-screen p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Reportes</h1>
                    <p className="font-sight">Gestión y seguimiento de casos</p>

                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
                    {vm.filterOptions.map((filter: { value: string; total: number }) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => vm.setSelectedFilter(filter.value)}
                            aria-pressed={vm.selectedFilter === filter.value}
                            className={
                                vm.selectedFilter === filter.value
                                    ? 'btn-primary rounded-full px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2'
                                    : 'btn-secondary rounded-full px-3 py-1.5 text-sm sm:px-4 sm:py-2'
                            }
                        >
                            {filter.value} <span className="opacity-70">({filter.total})</span>
                        </button>
                    ))}
                </div>
                </header>

                <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="relative">
                            <svg
                                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 font-diffuse"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                            <input
                                type="search"
                                value={vm.searchQuery}
                                onChange={(e) => vm.setSearchQuery(e.target.value)}
                                placeholder="Buscar por folio, colonia o calle..."
                                aria-label="Buscar reportes"
                                className="input-field w-full rounded-xl py-3 pl-12 pr-4 text-sm sm:text-base"
                            />
                        </div>

                        <section aria-label="Lista de reportes" className="flex flex-col gap-4">
                            {vm.reports.length === 0 ? (
                                <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                                    No hay reportes que coincidan con la búsqueda.
                                </p>
                            ) : (
                                vm.reports.map((report) => (
                                    <ReportCard
                                        key={report.id_reporte}
                                        report={report}
                                        onCaseCreated={(caseId) => navigate(`/case/${caseId}`)}
                                    />
                                ))
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReportPage;