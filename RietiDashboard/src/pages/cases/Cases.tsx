import SideBar from '@/components/ui/SideBar'
import { useNavigate } from 'react-router-dom'
import { CaseCard } from './components/CaseCard'
import { StatusChart } from '@/components/ui/StatusChart'
import { useCases } from './useCases'
import { Footer } from '@/components/layout/Footer'
import Loading from '@/components/ui/Loading'
import { Forbidden } from '@/components/ui/Forbidden'
import { SelectionToolbar } from '@/components/ui/SelectionToolbar'
import { LoadError } from '@/components/ui/LoadError'
import { ALL_OPTION } from '@/lib/utilities/filters'

/** List of cases with a state filter and a search box; each card opens the case page and an admin can select the closed cases to delete them */
const CasesPage = () => {
    const navigate = useNavigate()
    const vm = useCases()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Casos</h1>
                    <p className="font-sight">Seguimiento y atención de casos</p>

                    {!vm.forbidden && !vm.loadFailed && (
                        <>
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
                            {!vm.loading && (
                                <StatusChart
                                    title="Casos por estado"
                                    options={vm.filterOptions}
                                    allValue={ALL_OPTION}
                                    selected={vm.selectedFilter}
                                    onSelect={vm.setSelectedFilter}
                                />
                            )}
                        </>
                    )}
                </header>

                <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
                    {vm.loading ? (
                        <Loading />
                    ) : vm.forbidden ? (
                        <Forbidden className="py-10" />
                    ) : vm.loadFailed ? (
                        <LoadError message="No se pudieron cargar los casos" onRetry={vm.reload} />
                    ) : (
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <input
                                type="search"
                                value={vm.search}
                                onChange={(e) => vm.setSearch(e.target.value)}
                                placeholder="Buscar por número, colonia o calle..."
                                aria-label="Buscar casos"
                                className="input-field w-full rounded-xl py-3 text-sm sm:text-base"
                            />

                            <section aria-label="Lista de casos" className="flex flex-col gap-4">
                                {vm.canSelect && (vm.cases.length > 0 || vm.selection.active) && (
                                    <SelectionToolbar
                                        selection={vm.selection}
                                        onDelete={vm.removeSelected}
                                        singular="caso"
                                        plural="casos"
                                        skippedReason="ya no existen o no están cerrados"
                                    />
                                )}
                                {vm.cases.length === 0 ? (
                                    <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                                        No hay casos que coincidan con la búsqueda.
                                    </p>
                                ) : (
                                    vm.cases.map((caso) => (
                                        <CaseCard
                                            key={caso.id_caso}
                                            caso={caso}
                                            reportCount={caso.cantidad_reportes}
                                            onOpen={() => navigate(`/cases/${caso.id_caso}`)}
                                            selection={
                                                vm.selection.active
                                                    ? {
                                                          selected: vm.selection.isSelected(caso.id_caso),
                                                          onToggle: () => vm.selection.toggle(caso.id_caso),
                                                      }
                                                    : undefined
                                            }
                                        />
                                    ))
                                )}
                            </section>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default CasesPage
