import type { Caso } from '@/lib/types/Case';
import { URGENCY_STYLES, formatDateTime, statusStyle } from '@/lib/utilities/reportStyles';

interface Props {
    /** Case to show */
    caso: Caso;
    /** Number of reports attached to the case */
    reportCount: number;
    /** Called when the card is clicked */
    onOpen: () => void;
}

/** Summary card of a case in the cases list */
export function CaseCard({ caso, reportCount, onOpen }: Props) {
    const style = statusStyle(caso.estado);

    return (
        <article className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-mono text-lg font-bold font-accent">Caso #{caso.id_caso}</h2>
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                        {caso.estado}
                    </span>
                    <span className={`text-sm font-medium ${URGENCY_STYLES[caso.urgencia] ?? 'font-diffuse'}`}>
                        Urgencia {caso.urgencia.toLowerCase()}
                    </span>
                    <span className="rounded-full bg-component px-3 py-1 text-sm font-diffuse">
                        {reportCount === 1 ? '1 reporte' : `${reportCount} reportes`}
                    </span>
                </div>

                <p className="mt-3 font-semibold">
                    {caso.ubicacion.colonia} · {formatDateTime(caso.fecha_caso)}
                </p>
                <p className="font-diffuse">{caso.ubicacion.calle}</p>
                {caso.notas && <p className="line-clamp-2 text-sm">{caso.notas}</p>}
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
            >
                Ver caso →
            </button>
        </article>
    );
}
