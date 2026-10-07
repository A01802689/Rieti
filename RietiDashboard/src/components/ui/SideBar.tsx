import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const dashboardLinks = [
    { label: 'Mapa de Calor', path: '/map' },
    { label: 'Reportes', path: '/reports' },
    { label: 'Logs', path: '/logs' },
];

const itemBaseClass =
    'flex w-full items-center rounded-lg p-3 text-start leading-tight outline-none transition-all duration-200 ' +
    'hover:bg-component hover:text-blue-gray-900 hover:shadow-md md:hover:scale-105 ' +
    'focus-visible:ring-2 focus-visible:ring-blue-gray-300 cursor-pointer';

function DashboardIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
            <path
                fillRule="evenodd"
                d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
    );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    );
}

function CasesIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
            <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function LogOutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
            <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="h-6 w-6 dark:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

export default function SideBar() {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const goTo = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const activeClass = (path: string) =>
        location.pathname === path ? 'bg-component text-blue-gray-900 font-medium' : 'text-blue-gray-700';

    return (
        <>
            {/* Mobile menu button */}
            <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={isMobileMenuOpen}
                className="fixed left-4 top-4 z-40 rounded-lg bg-card p-2 shadow-md md:hidden"
            >
                <MenuIcon />
            </button>

            {/* Mobile overlay */}
            <div
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
                    isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] p-4 transition-transform duration-300 ease-in-out
                    md:static md:z-auto md:w-full md:max-w-none md:translate-x-0 md:p-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-full w-full flex-col overflow-y-auto rounded-xl bg-card bg-clip-border p-4 font-clear shadow-xl md:h-[calc(100vh-2rem)]">
                    <div className="mb-2 flex items-center justify-between p-4">
                        <h5 className="block font-sans text-xl font-semibold leading-snug tracking-normal antialiased font-clear">
                            Menu
                        </h5>
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Cerrar menú"
                            className="rounded-lg p-1 hover:bg-component md:hidden"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <nav className="flex min-w-0 flex-col gap-1 p-2 font-sans text-base font-normal font-clear">
                        {/* Home */}
                        <button type="button" onClick={() => goTo('/home')} className={`${itemBaseClass} ${activeClass('/home')}`}>
                            <span className="mr-4 grid place-items-center">
                                <HomeIcon />
                            </span>
                            Home
                        </button>

                        {/* Dashboard dropdown */}
                        <div className="w-full">
                            <button
                                type="button"
                                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                                aria-expanded={isDashboardOpen}
                                className={`${itemBaseClass} justify-between text-blue-gray-700`}
                            >
                                <span className="mr-4 grid place-items-center">
                                    <DashboardIcon />
                                </span>
                                <span className="mr-auto">Dashboard</span>
                                <span className="ml-4">
                                    <ChevronIcon isOpen={isDashboardOpen} />
                                </span>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    isDashboardOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="flex flex-col gap-1 py-1 pl-9">
                                    {dashboardLinks.map((link) => (
                                        <button
                                            key={link.path}
                                            type="button"
                                            onClick={() => goTo(link.path)}
                                            tabIndex={isDashboardOpen ? 0 : -1}
                                            className={`${itemBaseClass} text-sm ${activeClass(link.path)}`}
                                        >
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cases */}
                        <button type="button" onClick={() => goTo('/case')} className={`${itemBaseClass} ${location.pathname.startsWith('/case') ? 'bg-component text-blue-gray-900 font-medium' : 'text-blue-gray-700'}`}>
                            <span className="mr-4 grid place-items-center">
                                <CasesIcon />
                            </span>
                            Casos
                        </button>

                        {/* Users */}
                        <button type="button" onClick={() => goTo('/users')} className={`${itemBaseClass} ${activeClass('/users')}`}>
                            <span className="mr-4 grid place-items-center">
                                <UsersIcon />
                            </span>
                            Usuarios
                        </button>

                        {/* Log out */}
                        <button type="button" onClick={() => goTo('/')} className={`${itemBaseClass} text-blue-gray-700`}>
                            <span className="mr-4 grid place-items-center">
                                <LogOutIcon />
                            </span>
                            Log Out
                        </button>
                    </nav>
                </div>
            </aside>
        </>
    );
}