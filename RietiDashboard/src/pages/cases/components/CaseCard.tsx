import type { Caso } from '@/lib/types/Case'
import { SelectCheckbox } from '@/components/ui/SelectCheckbox'
import { Empty } from '@/components/ui/ReportDetails'
import type { CardSelection } from '@/lib/utilities/useSelection'
import { cn } from '@/lib/utilities/utils'
import { URGENCY_STYLES, formatDateTime, statusStyle } from '@/lib/utilities/reportStyles'

interface Props {
    /** Case to show */
    caso: Caso
    /** Number of reports attached to the case */
    reportCount: number
    /** Called when the "Ver caso" button is clicked */
    onOpen: () => void
    /** Passed only while the list is in selection mode: the card shows a checkbox, toggles when clicked and hides its button */
    selection?: CardSelection
}

/** Summary card of a case in the cases list */
export function CaseCard({ caso, reportCount, onOpen, selection }: Props) {
    const style = statusStyle(caso.estado)

    return (
        <article
            onClick={selection?.onToggle}
            className={cn(
                'flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6 lg:flex-row lg:items-start lg:justify-between',
                selection && 'cursor-pointer',
                selection?.selected && 'card-selected',
            )}
        >
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                    {selection && <SelectCheckbox label={`Seleccionar caso ${caso.id_caso}`} selection={selection} />}
                    <h2 className="font-mono text-lg font-bold font-accent">Caso #{caso.id_caso}</h2>
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                        {caso.estado}
                    </span>
                    <span className={`text-sm font-medium ${URGENCY_STYLES[caso.urgencia ?? ''] ?? 'font-diffuse'}`}>
                        {caso.urgencia ? `Urgencia ${caso.urgencia.toLowerCase()}` : 'Sin urgencia'}
                    </span>
                    <span className="rounded-full bg-component px-3 py-1 text-sm font-diffuse">
                        {reportCount === 1 ? '1 reporte' : `${reportCount} reportes`}
                    </span>
                </div>

                <p className="mt-3 font-semibold">
                    {caso.ubicacion.colonia ?? <Empty text="Sin dato" />} · {formatDateTime(caso.fecha_caso)}
                </p>
                <p className="font-diffuse">{caso.ubicacion.calle ?? <Empty text="Sin dato" />}</p>
                {caso.notas && <p className="line-clamp-2 text-sm">{caso.notas}</p>}
            </div>

            {!selection && (
                <button
                    type="button"
                    onClick={onOpen}
                    className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
                >
                    Ver caso →
                </button>
            )}
        </article>
    )
}
