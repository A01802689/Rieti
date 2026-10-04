import SideBar from '../../components/ui/SideBar';
import InfoKpis from './components/KpiHome/InfoKpi';
import LineGraph from './components/Graph/Graph';
import HeatMap from '@/components/ui/HeatMap';
import { useNavigate } from 'react-router-dom';
const graphData = [
    { name: 'Enero', value: 20 },
    { name: 'Febrero', value: 35 },
    { name: 'Marzo', value: 28 },
    { name: 'Abril', value: 50 },
    { name: 'Mayo', value: 65 },
    { name: 'Junio', value: 80 },
];

const stats = 
[ { label: 'Municipios participantes', value: '12', note: 'en la ruta', tone: 'bg-teal-600', }, 
    { label: 'Casos identificados', value: '148', note: 'este año', tone: 'bg-amber-500', }, 
    { label: 'Casos en seguimiento', value: '63', note: 'activos', tone: 'bg-blue-600', }, 
    { label: 'Casos cerrados', value: '85', note: 'Con restitución de derechos', tone: 'bg-emerald-600', }, 
];


const HomePage = () => {
    const navigate = useNavigate();
    return(
            <div className="min-h-screen bg-page transition-colors duration-300">

                <div className='fixed left-0 top-0 z-10 h-screen w-60 p-4'>
                    <SideBar />
                </div>

                <div className = "ml-60 min-h-screen p-6">
                    <header className='rounded-xl bg-card px-8 py-6 shadow-sm transition-colors duration-300'>
                        <h1> Ruta Intermunicipal para la Erradicacion del Trabajo Infantil</h1>
                        <p className='font-sight'> Resumen general de casos, seguimietno y actividad reciente</p>
                    </header>

                    <main className='mt-6 rounded-xl bg-panel p-8 transition-colors duration-300'>

                        <div className='flex flex-col gap-8'>
                            <section aria-label='Resumen'>
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                                    {stats.map((stat) => (
                                        <InfoKpis
                                            key={stat.label}
                                            label={stat.label}
                                            value={stat.value}
                                            note={stat.note}
                                            tone={stat.tone}
                                        />
                                    ))}
                                </div>
                            </section>
                            <section aria-label='Graph'>
                                <LineGraph data={graphData} />
                            </section>
                            <div className='w-full rounded-xl bg-card p-6 shadow-sm transition-colors duration-300'>
                                <section aria-label='Map'>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-card">
                                        <div className=''>
                                            <h2>
                                                Mapa de calor
                                            </h2>
                                            <p className='font-sight'>
                                                Distribucion geografica por cantidad de casos
                                            </p>
                                            <div className='flex items-center gap-3 bg-component px-3.5 py-1.5 rounded-lg'>
                                                <span className='text-xs font-medium font-clear'>
                                                    Nivel de Riesgo:
                                                </span>
                                                <div className='flex items-center gap-1.5 '>
                                                    <span className='h-2.5 w-2.5 rounded-full bg-green-600'/>
                                                    <span className='text-xs font-diffuse p-1'> Nivel bajo de indices de reportes </span>
                                                </div>
                                                <div className='flex items-center gap-1.5 '>
                                                    <span className='h-2.5 w-2.5 rounded-full bg-orange-400'/>
                                                    <span className='text-xs font-diffuse p-1'>Nivel medio de indice de reportes </span>
                                                </div>
                                                <div className='flex items-center gap-1.5 '>
                                                    <span className='h-2.5 w-2.5 rounded-full bg-red-600'/>
                                                    <span className='text-xs font-diffuse p-1'> Nivel alto de indice de reportes </span>
                                                </div>
                                                <div>
                                                    <button className='btn-secondary px-4 py-1.5 text-xs font-semibold transition-all rounded-lg outline-none'
                                                     onClick={() => navigate('/mapa')}>
                                                        Ir al mapa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-[500px] w-full overflow-hidden rounded-lg p-5'>
                                        <HeatMap/>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </main>

                </div>
            </div>
    )
}
export default HomePage;
