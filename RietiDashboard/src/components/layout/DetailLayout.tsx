import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '@/components/ui/SideBar'
import Loading from '@/components/ui/Loading'
import { Footer } from '@/components/layout/Footer'

interface DetailLayoutProps {
    /** Shows the spinner instead of the content */
    loading: boolean
    /** Whether the resource exists; when false the "not found" header is shown */
    found: boolean
    /** Title of the "not found" header */
    notFound: string
    /** Route of the list that the "Volver" button goes to */
    backTo: string
    /** Content of the page, rendered once the resource is loaded */
    children: ReactNode
}

/** Frame of a detail page: sidebar, loading spinner, "not found" header and footer */
export function DetailLayout({ loading, found, notFound, backTo, children }: DetailLayoutProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-page transition-colors duration-300">
            <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                <SideBar />
            </div>

            <div className="flex min-h-screen flex-col p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
                {loading ? (
                    <Loading />
                ) : found ? (
                    children
                ) : (
                    <header className="rounded-xl bg-card px-5 py-5 shadow-sm sm:px-8 sm:py-6">
                        <button type="button" onClick={() => navigate(backTo)} className="btn-secondary mb-3 rounded-lg px-3 py-1.5 text-sm">
                            ← Volver
                        </button>
                        <h1>{notFound}</h1>
                    </header>
                )}
                <Footer />
            </div>
        </div>
    )
}
