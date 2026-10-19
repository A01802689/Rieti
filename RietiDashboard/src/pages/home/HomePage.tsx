import SideBar from '@/components/ui/SideBar'
import InfoKpi from './components/InfoKpi'
import LineGraph from './components/LineGraph'
import HeatMap from '@/components/ui/HeatMap'
import { StatusChart } from '@/components/ui/StatusChart'
import { useNavigate } from 'react-router-dom'
import { useHome } from './useHome'
import { Footer } from '@/components/layout/Footer'
import { Forbidden } from '@/components/ui/Forbidden'
import { useAuth } from '@/context/auth'
import { ALL_OPTION } from '@/lib/utilities/filters'

/** Risk levels explained next to the map preview */
const riskLevels = [
    { label: 'Nivel bajo de índice de reportes', color: 'bg-green-600' },
    { label: 'Nivel medio de índice de reportes', color: 'bg-orange-400' },
    { label: 'Nivel alto de índice de reportes', color: 'bg-red-600' },
]

/** Home page: KPI cards, cases chart and, for users who can see the map, a preview of the heat map */
const HomePage = () => {
    const navigate = useNavigate()
    const { can } = useAuth()
    const { stats, graphData, caseStatus, reportStatus, forbidden } = useHome()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
                    <h1>Ruta Intermunicipal para la Erradicación del Trabajo Infantil</h1>
                    <p className="font-sight">Resumen general de casos, seguimiento y actividad reciente</p>
                </header>

                <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
                    {forbidden ? (
                        <Forbidden className="py-10" />
                    ) : (
                        <div className="flex flex-col gap-6 sm:gap-8">
                            {can('map.view') && (
                                <section
                                    aria-label="Map"
                                    className="w-full rounded-xl bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6"
                                >
                                    <div className="mb-4 flex flex-col gap-4 border-b border-card pb-3 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <h2>Mapa de calor</h2>
                                                <p className="font-sight">Distribución geográfica por cantidad de casos</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-component px-3.5 py-2">
                                                <span className="text-xs font-medium font-clear">Nivel de riesgo:</span>
                                                {riskLevels.map((level) => (
                                                    <div key={level.label} className="flex items-center gap-1.5">
                                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${level.color}`} />
                                                        <span className="p-1 text-xs font-diffuse">{level.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/map')}
                                            className="btn-secondary w-full rounded-lg px-4 py-2 text-xs font-semibold outline-none transition-all sm:w-auto"
                                        >
                                            Ir al mapa
                                        </button>
                                    </div>

                                    <div className="h-80 w-full overflow-hidden rounded-lg sm:h-105 sm:p-5 lg:h-125">
                                        <HeatMap />
                                    </div>
                                </section>
                            )}

                            <section aria-label="Resumen">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
                                    {stats.map((stat) => (
                                        <InfoKpi
                                            key={stat.label}
                                            label={stat.label}
                                            value={stat.value}
                                            note={stat.note}
                                            tone={stat.tone}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section aria-label="Graph" className="w-full min-w-0 overflow-x-auto">
                                <LineGraph data={graphData} />
                            </section>

                            <section aria-label="Estatus de casos y reportes" className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
                                <div className="rounded-xl bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
                                    <StatusChart title="Casos por estado" options={caseStatus} allValue={ALL_OPTION} className="" />
                                </div>
                                <div className="rounded-xl bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
                                    <StatusChart title="Reportes por estatus" options={reportStatus} allValue={ALL_OPTION} className="" />
                                </div>
                            </section>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default HomePage