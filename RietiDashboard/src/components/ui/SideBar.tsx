import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SideBar(){
    const [isDashOpen, setIsDashOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    
    return (
        
        <div
            className="relative flex h-[calc(100vh-2rem)] w-full flex-col rounded-xl bg-card bg-clip-border p-4 font-clear shadow-xl">
                <div className="p-4 mb-2">
                <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal font-clear">
                Menu
                </h5>
            </div>
            <nav className="flex min-w-0 flex-col gap-1 p-2 font-sans text-base font-normal font-clear">
                <div className="relative block w-full">
                <div role="button" onClick={() => setIsDashOpen(!isDashOpen)} className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none bg-blue-gray-50/50 text-start text-blue-gray-700 hover:bg-component hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <button type="button"
                        className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-900 hover:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                        className="w-5 h-5">
                        <path fill-rule="evenodd"
                            d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z"
                            clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed font-clear">
                        Dashboard
                    </p>
                    <span className="ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" aria-hidden="true" className={`w-4 h-4 mx-auto transition-transform ${isDashOpen ? "rotate-180" : ""}`}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                        </svg>
                    </span>
                    </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${isDashOpen ? "max-h-96 opacity-100" : "max-h-0" }`}>
                    <div className="block w-full py-1 font-sans text-sm antialiased font-light leading-normal font-clear">
                    <nav className="flex min-w-0 flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
                        <div role="button"
                        onClick={() =>navigate('/mapa')}
                        className="flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                        <div className="grid mr-4 place-items-center">
                        </div>
                        Mapa de Calor
                        </div>
                        <div role="button"
                        onClick={() =>navigate('/reports')}
                        className="flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md  hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                        <div className="grid mr-4 place-items-center">
                        </div>
                        Reportes
                        </div>
                        <div role="button"
                        onClick={() =>navigate('/logs')}
                        className="flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                        <div className="grid mr-4 place-items-center">
                        </div>
                        Logs
                        </div>
                    </nav>
                    </div>
                </div>
                </div>
                <div className="relative block w-full">
                <div role="button"
                    className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start duration-200 hover:scale-105 hover:shadow-md hover:bg-component hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <button type="button"
                        onClick={()=>navigate('/casos')}
                    className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
                            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
                        </svg>
                    </div>
                    <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed font-clear">
                        Casos
                    </p>
                    <span className="ml-4"></span>
                    </button>
                </div>
                </div>
                <div role="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md  hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                        <div className="grid mr-4 place-items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                                className="w-5 h-5">
                                <path fill-rule="evenodd"
                                    d="M6.912 3a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z"
                                    clip-rule="evenodd"></path>
                    </svg>
                </div>
                Inbox
                <div className="grid ml-auto place-items-center justify-self-end">
                    <div
                    className="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-full select-none whitespace-nowrap bg-blue-gray-500/20 text-blue-gray-900">
                    <span className="">14</span>
                    </div>
                </div>
                </div>
                <div role="button"
                onClick={()=>navigate('/usuarios')}
                className="flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                    className="w-5 h-5">
                    <path fill-rule="evenodd"
                        d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                </div>
                Usuarios
                </div>
                <div role="button"
                onClick={() =>navigate('/')}
                className="flex items-center w-full p-3 leading-tight rounded-lg outline-none text-start transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-component hover:text-blue-gray-900 cursor-pointer">
                <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                    className="w-5 h-5">
                    <path fill-rule="evenodd"
                        d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
                        clip-rule="evenodd"></path>
                    </svg>
                </div>
                Log Out
                </div>
            </nav>
            {showNotifications && (
                <div className='absolute left-full top-32 ml-3 z-50 w-40 rounded-xl bg-card p-5 shadow-xl border border-card'>
                    <h2 className='mb-4 text-lg font-semibold font-clear'>
                        Notificaciones
                    </h2>
                    <div className='border-b border-card pb-3'>
                        <p className='font-medium'>
                            Seguimiento Vence mañana
                        </p>
                        <p className='text-sm'>
                            El caso 4 tiene 5 dias de cierre
                        </p>
                    </div>
                    <div className='border-b border-card pb-3'>
                        <p className='font-medium'>
                            Seguimiento Vence mañana
                        </p>
                        <p className='text-sm'>
                            El caso 4 tiene 5 dias de cierre
                        </p>
                    </div>
                    <div className='border-b border-card pb-3'>
                        <p className='font-medium'>
                            Seguimiento Vence mañana
                        </p>
                        <p className='text-sm'>
                            El caso 4 tiene 5 dias de cierre
                        </p>
                    </div>
                    
                </div>
            )}
</div>

    )
}