import { DocumentIcon, UserIcon } from './CaseIcons'
import type { Caso } from '@/lib/types/Case'
import type { Reporte } from '@/lib/types/Report'
import { Empty, Field } from '@/components/ui/ReportDetails'
import { ReportImage } from '@/components/ui/ReportImage'
import { formatDateTime } from '@/lib/utilities/reportStyles'

/**
 * Titled card of the case page
 *
 * @param title - Heading of the card
 * @param icon - Icon next to the title
 * @param tone - Classes that color the icon badge
 * @param action - Optional control placed at the right of the title, e.g. an edit button
 * @param children - Content of the card
 */
export function Card({ title, icon, tone, action, children }: { title: string; icon: React.ReactNode; tone: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
            <div className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${tone}`} aria-hidden>
                    {icon}
                </span>
                <h2 className="p-0">{title}</h2>
                {action && <div className="ml-auto shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    )
}

/**
 * Card with the data of the people who reported the case, built from the first report because reports carry no contact data
 *
 * @param reports - Reports of the case
 */
export function ReporterCard({ reports }: { reports: Reporte[] }) {
    const first = reports[0]
    return (
        <Card title="Información del denunciante" icon={<UserIcon />} tone="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
            {first ? (
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Field label="Reportante">
                        {first.id_usuario === null ? 'Anónimo' : `Usuario #${first.id_usuario}`}
                    </Field>
                    <Field label="Primer reporte">{first.folio_reporte}</Field>
                    <Field label="Fecha">{formatDateTime(first.fecha_reporte)}</Field>
                </dl>
            ) : (
                <Empty text="Este caso no tiene reportes asociados." />
            )}
        </Card>
    )
}

/**
 * Card with the main data of the case: municipio, descriptions and photos; the classification (minors, age, work type) is in CaseEditCard and the location in CaseLocationCard
 *
 * @param caso - Case shown
 * @param reports - Reports of the case
 */
export function CaseDataCard({ caso, reports }: { caso: Caso; reports: Reporte[] }) {
    const descriptions = reports.filter((r) => r.descripcion)
    const photos = reports.filter((r) => r.imagen)

    return (
        <Card title="Datos del caso" icon={<DocumentIcon />} tone="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            <dl className="grid grid-cols-1 gap-2">
                <Field label="Municipio">{caso.municipio.nombre}</Field>
            </dl>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Descripción</p>
                <div className="flex flex-col gap-2 rounded-lg bg-component px-4 py-3">
                    {descriptions.length === 0 ? (
                        <Empty text="Sin descripción" />
                    ) : (
                        descriptions.map((r) => (
                            <p key={r.id_reporte} className="p-0 text-sm">
                                {r.descripcion}
                            </p>
                        ))
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Fotografías</p>
                {photos.length === 0 ? (
                    <ReportImage reportId={null} alt="" className="h-24" />
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {photos.map((r) => (
                            <ReportImage key={r.id_reporte} reportId={r.id_reporte} alt={`Foto del reporte ${r.folio_reporte}`} className="h-48" />
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}
