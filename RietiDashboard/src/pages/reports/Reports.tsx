import SideBar from '../../components/ui/SideBar';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from './components/ReportCard';
import { useReportesVM } from '@/lib/VM/Usereportescm';


const ReportPage = () => {
    const navigate = useNavigate();
    const vm = useReportesVM();
    return(
            <div className="min-h-screen bg-slate-200 dark:bg-slate-950 transition-colors duration-300">

                <div className='fixed left-0 top-0 z-10 h-screen w-60 p-4'>
                    <SideBar />
                </div>

                <div className = "ml-60 min-h-screen p-3">
                    <div className='flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-lg'>
                        <header className='rounded-xl bg-white dark:bg-slate-900 px-8 py-6 shadow-sm transition-colors duration-300'>
                            <h1 className='text-2xl font-semibold tracking-wide text-slate-800 dark:text-white'> Reportes</h1>
                            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>Gestion y seguimeitnto de casos</p>
                            <div className='flex flex-wrap gap-2' role='group' aria-label='Filter by State'>
                                {vm.filtros.map((f: { value: string; total: number }) => (
                                    <button key={f.value} type='button' onClick={() => vm.setFiltro(f.value)} className={vm.filtro === f.value ? 'rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white' : 'rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}>
                                        {f.value} <span className='opacity-70'>({f.total})</span>
                                    </button>
                                ))}
                            </div>
                        </header>
                    </div>
                    <div className='p-1'>
                    </div>
                    <main className='mt-6 rounded-xl bg-blue-50 dark:bg-slate-800 p-8 transition-colors duration-300'>
                        <div className='flex flex-col gap-6'>
                            <div className='relative'>
                                <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-3.5-3.5" />
                                </svg>
                                <input
                                    type="search"
                                    value={vm.busqueda}
                                    onChange={(e) => vm.setBusqueda(e.target.value)}
                                    placeholder="Buscar por folio, colonia, calle o tipo de trabajo..."
                                    aria-label="Buscar reportes"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-blue-500/30"
                                />
                            </div>
                            <section aria-label="Lista de reportes" className="flex flex-col gap-4">
                                {vm.reportes.length === 0 ? (
                                    <p className="rounded-xl bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
                                    No hay reportes que coincidan con la búsqueda.
                                    </p>
                                ) : (
                                    vm.reportes.map((r) => (
                                    <ReporteCard
                                        key={r.id_reporte}
                                        reporte={r}
                                        onDetalle={() => navigate(`/reportes/${r.id_reporte}`)}
                                        onVerCaso={() => navigate(`/casos/${r.id_caso}`)}
                                    />
                                    ))
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
    )
}
export default ReportPage;
