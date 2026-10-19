import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { landingRoute } from '@/lib/routes'

/** Page shown when the route does not exist, with links to go back or to the page where the user starts */
const NotFoundPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-page p-4 transition-colors duration-300">
            <main className="w-full max-w-md rounded-xl bg-card p-6 text-center shadow-sm transition-colors duration-300 sm:p-10">
                <p className="p-0 text-6xl font-bold font-accent sm:text-7xl">404</p>
                <h1 className="mt-2">Página no encontrada</h1>
                <p className="font-sight">La dirección que buscas no existe o fue movida.</p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary rounded-lg px-4 py-2 text-sm"
                    >
                        ← Volver
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(landingRoute(user))}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Ir al inicio
                    </button>
                </div>
            </main>
        </div>
    )
}

export default NotFoundPage
