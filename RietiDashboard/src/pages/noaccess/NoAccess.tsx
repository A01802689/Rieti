import { LockKeyhole } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { NO_ACCESS_ROUTE, landingRoute } from '@/lib/routes'
import { useNoAccess } from './useNoAccess'

/** Page for a user of the panel who has no page to see yet: asks them to request permissions, lets them check again and close the session; as soon as a page is available it sends them there */
const NoAccessPage = () => {
    const { user } = useAuth()
    const vm = useNoAccess()
    const landing = landingRoute(user)

    if (landing !== NO_ACCESS_ROUTE) return <Navigate to={landing} replace />

    return (
        <div className="flex min-h-screen items-center justify-center bg-page p-4 transition-colors duration-300">
            <main className="w-full max-w-md rounded-xl bg-card p-6 text-center shadow-sm transition-colors duration-300 sm:p-10">
                <LockKeyhole className="mx-auto size-12 font-diffuse" aria-hidden />
                <h1 className="mt-2">Aún no tienes acceso</h1>
                <p className="font-sight">
                    Tu cuenta no tiene permisos que den acceso a esta función. Si esto es un error, contacta a un administrador para actualizar tus permisos.
                </p>

                {vm.stillEmpty && !vm.updating && (
                    <p role="status" className="mt-3 text-sm font-medium">
                        Tu cuenta sigue sin permisos nuevos.
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={vm.signOut}
                        className="btn-secondary rounded-lg px-4 py-2 text-sm"
                    >
                        Cerrar sesión
                    </button>
                    <button
                        type="button"
                        onClick={vm.update}
                        disabled={vm.updating}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {vm.updating ? 'Actualizando…' : 'Actualizar permisos'}
                    </button>
                </div>
            </main>
        </div>
    )
}

export default NoAccessPage
