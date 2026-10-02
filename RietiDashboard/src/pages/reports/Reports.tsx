import SideBar from '../../components/ui/SideBar';
import { useNavigate } from 'react-router-dom';



const ReportPage = () => {
    const navigate = useNavigate();
//    const vm = useReportesVM()
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
                        </header>
                    </div>
                    <div></div>

                    <main className='mt-6 rounded-xl bg-blue-50 dark:bg-slate-800 p-8 transition-colors duration-300'>

                        <div className='flex flex-col gap-8'>
                            <section aria-label='Resumen'>
                            </section>
                            <section aria-label='Graph'>
                            </section>
                            <div className='w-full rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300'>
                                
                            </div>
                        </div>
                    </main>

                </div>
            </div>
    )
}
export default ReportPage;
