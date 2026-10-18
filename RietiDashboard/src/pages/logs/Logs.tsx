import SideBar from '@/components/ui/SideBar'
import SearchInput from '@/components/ui/SearchInput'
import Loading from '@/components/ui/Loading'
import { Forbidden } from '@/components/ui/Forbidden'
import { Footer } from '@/components/layout/Footer'
import { LogTable } from './components/LogTable'
import { useLogs } from './useLogs'

/** Logs of the system with a filter by kind of record, a search box and a table whose rows open the data before and after each change */
const LogsPage = () => {
    const vm = useLogs()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Logs</h1>
                    <p className="font-sight">Registro de la actividad del sistema</p>

                    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por entidad">
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
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <SearchInput
                            value={vm.searchQuery}
                            onChange={vm.setSearchQuery}
                            placeholder="Buscar por usuario, acción o id del registro..."
                            label="Buscar logs"
                        />

                        <section aria-label="Lista de logs" className="flex flex-col gap-4">
                            {vm.loading ? (
                                <Loading />
                            ) : vm.forbidden ? (
                                <Forbidden className="py-10" />
                            ) : (
                                <>
                                    {vm.error && (
                                        <p role="alert" className="rounded-xl bg-card p-6 text-center text-red-700 sm:p-8 dark:text-red-300">
                                            No se pudieron cargar los logs. Intenta de nuevo más tarde.
                                        </p>
                                    )}
                                    {vm.logs.length > 0 ? (
                                        <LogTable logs={vm.logs} expandedId={vm.expandedId} onToggle={vm.toggleExpanded} />
                                    ) : (
                                        !vm.error && (
                                            <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                                                No hay logs que coincidan con el filtro o la búsqueda.
                                            </p>
                                        )
                                    )}
                                    {vm.hasMore && (
                                        <button
                                            type="button"
                                            onClick={vm.loadMore}
                                            disabled={vm.loadingMore}
                                            className="btn-secondary self-center rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {vm.loadingMore ? 'Cargando...' : 'Cargar más'}
                                        </button>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default LogsPage
