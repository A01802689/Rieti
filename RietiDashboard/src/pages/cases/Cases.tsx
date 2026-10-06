import SideBar from '../../components/ui/SideBar';
import { useNavigate } from 'react-router-dom';
import { CaseCard } from './components/CaseCard';
import { useCasesViewModel } from '@/lib/VM/Usecases';

const CasesPage = () => {
    const navigate = useNavigate();
    const vm = useCasesViewModel();

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="min-h-screen p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Casos</h1>
                    <p className="font-sight">Seguimiento y atención de casos</p>

                    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
                        {vm.filterOptions.map((filter) => (
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
                        <input
                            type="search"
                            value={vm.searchQuery}
                            onChange={(e) => vm.setSearchQuery(e.target.value)}
                            placeholder="Buscar por número, colonia o calle..."
                            aria-label="Buscar casos"
                            className="input-field w-full rounded-xl py-3 text-sm sm:text-base"
                        />

                        <section aria-label="Lista de casos" className="flex flex-col gap-4">
                            {vm.cases.length === 0 ? (
                                <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                                    No hay casos que coincidan con la búsqueda.
                                </p>
                            ) : (
                                vm.cases.map((caso) => (
                                    <CaseCard
                                        key={caso.id_caso}
                                        caso={caso}
                                        reportCount={vm.reportCounts.get(caso.id_caso) ?? 0}
                                        onOpen={() => navigate(`/case/${caso.id_caso}`)}
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

export default CasesPage;
