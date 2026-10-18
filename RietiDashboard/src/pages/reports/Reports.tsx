import SideBar from '@/components/ui/SideBar'
import SearchInput from '@/components/ui/SearchInput'
import { useNavigate } from 'react-router-dom'
import { ReportCard } from './components/ReportCard'
import { StatusChart } from '@/components/ui/StatusChart'
import { useReports } from './useReports'
import { Footer } from '@/components/layout/Footer'
import { SelectionToolbar } from '@/components/ui/SelectionToolbar'
import { Forbidden } from '@/components/ui/Forbidden'
import Loading from '@/components/ui/Loading'
import { LoadError } from '@/components/ui/LoadError'
import { ALL_OPTION } from '@/lib/utilities/filters'

/** Reports list with a status filter and a search box; an admin can select the rejected reports to delete them */
const ReportPage = () => {
    const navigate = useNavigate()
    const vm = useReports()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Reportes</h1>
                    <p className="font-sight">Gestión y seguimiento de casos</p>

                    {!vm.forbidden && !vm.loadFailed && (
                        <>
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

                            <StatusChart
                                title="Reportes por estatus"
                                options={vm.filterOptions}
                                allValue={ALL_OPTION}
                                selected={vm.selectedFilter}
                                onSelect={vm.setSelectedFilter}
                            />
                        </>
                    )}
                </header>

                <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
                    {vm.loading ? (
                        <Loading />
                    ) : vm.forbidden ? (
                        <Forbidden className="py-10" />
                    ) : vm.loadFailed ? (
                        <LoadError message="No se pudieron cargar los reportes" onRetry={vm.reload} />
                    ) : (
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <SearchInput
                                value={vm.searchQuery}
                                onChange={vm.setSearchQuery}
                                placeholder="Buscar por folio, colonia o calle..."
                                label="Buscar reportes"
                            />

                            <section aria-label="Lista de reportes" className="flex flex-col gap-4">
                                {vm.canSelect && (vm.reports.length > 0 || vm.selection.active) && (
                                    <SelectionToolbar
                                        selection={vm.selection}
                                        onDelete={vm.removeSelected}
                                        singular="reporte"
                                        plural="reportes"
                                        skippedReason="ya no existen o no están rechazados"
                                    />
                                )}
                                {vm.reports.length === 0 ? (
                                    <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                                        No hay reportes que coincidan con la búsqueda.
                                    </p>
                                ) : (
                                    vm.reports.map((report) => (
                                        <ReportCard
                                            key={report.id_reporte}
                                            report={report}
                                            onCaseCreated={(caseId) => navigate(`/cases/${caseId}`)}
                                            onChanged={vm.reload}
                                            selection={
                                                vm.selection.active
                                                    ? {
                                                          selected: vm.selection.isSelected(report.id_reporte),
                                                          onToggle: () => vm.selection.toggle(report.id_reporte),
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

export default ReportPage
