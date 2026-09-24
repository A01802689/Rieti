import SideBar from './components/SideBar';
import InfoKpis from './components/InfoKpi';
import LineGraph from './components/Graph';

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

// const notifications = 
// [ 
//     { title: 'Seguimiento vence mañana', detail: 'Caso #0138 requiere visita.', dot: 'bg-amber-500', },
//      { title: 'Caso derivado a tu municipio', detail: 'Revisa la información recibida.', dot: 'bg-blue-600', },
//       { title: 'Reporte mensual disponible', detail: 'Ya puedes descargarlo.', dot: 'bg-emerald-600', }, 
// ];

const HomePage = () => {
    return(
            <div className="min-h-screen bg-slate-200 dark:bg-slate-950 transition-colors duration-300">

                <div className='fixed left-0 top-0 z-10 h-screen w-60 p-4'>
                    <SideBar />
                </div>

                <div className = "ml-60 min-h-screen p-6">
                    <header className='rounded-xl bg-white dark:bg-slate-900 px-8 py-6 shadow-sm transition-colors duration-300'>
                        <h1 className='text-2xl font-semibold tracking-wide text-slate-800 dark:text-white'> Ruta Intermunicipal para la Erradicacion del Trabajo Infantil</h1>
                        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'> Resumen general de casos, seguimietno y actividad reciente</p>
                    </header>

                    <main className='mt-6 rounded-xl bg-blue-50 dark:bg-slate-800 p-8 transition-colors duration-300'>
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
                        </div>
                    </main>
                </div>
            </div>
    )
}
export default HomePage;
