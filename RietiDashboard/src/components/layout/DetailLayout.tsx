import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '@/components/ui/SideBar'
import Loading from '@/components/ui/Loading'
import { Forbidden } from '@/components/ui/Forbidden'
import { Footer } from '@/components/layout/Footer'
import { LoadError } from '@/components/ui/LoadError'

interface DetailLayoutProps {
    /** Shows the spinner instead of the content */
    loading: boolean
    /** Whether the resource exists; when false the "not found" header is shown */
    found: boolean
    /** Whether the API refused to show the resource because of a missing permission; it takes the place of the content and of the "not found" header */
    forbidden?: boolean
    /** Load failure other than a missing resource or a denied permission */
    error?: string
    /** Requests the detail again after a load failure */
    onRetry?: () => void
    /** Title of the "not found" header */
    notFound: string
    /** Route of the list that the "Volver" button goes to; without it the button is not shown, e.g. when the user cannot see that list */
    backTo?: string
    /** Content of the page, rendered once the resource is loaded */
    children: ReactNode
}

/** Frame of a detail page: sidebar, loading spinner, "not found" or "no permission" header and footer */
export function DetailLayout({ loading, found, forbidden = false, error, onRetry, notFound, backTo, children }: DetailLayoutProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                {loading ? (
                    <Loading />
                ) : forbidden ? (
                    <Forbidden className="py-10" />
                ) : error ? (
                    <LoadError message={error} onRetry={onRetry} />
                ) : found ? (
                    children
                ) : (
                    <header className="rounded-xl bg-card px-5 py-5 shadow-sm sm:px-8 sm:py-6">
                        {backTo && (
                            <button type="button" onClick={() => navigate(backTo)} className="btn-secondary mb-3 rounded-lg px-3 py-1.5 text-sm">
                                ← Volver
                            </button>
                        )}
                        <h1>{notFound}</h1>
                    </header>
                )}
                <Footer />
            </div>
        </div>
    )
}
