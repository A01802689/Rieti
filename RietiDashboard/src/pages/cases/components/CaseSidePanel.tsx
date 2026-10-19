import { InfoIcon, PencilIcon } from './CaseIcons'
import { useState } from 'react'
import type { Caso } from '@/lib/types/Case'
import type { Reporte } from '@/lib/types/Report'
import { addNote2Case } from '@/lib/api/cases'
import { hasValidLocation } from '@/lib/utilities/location'
import { caseFolio } from '@/lib/utilities/caseTimeline'
import { formatDateTime } from '@/lib/utilities/reportStyles'
import { useAction } from '@/lib/utilities/useAction'
import type { Mutate } from '../useCases'
import { Card } from './CaseInfo'

/**
 * Card to write a note in the timeline of a case
 *
 * @param caso - Case that receives the note
 * @param mutate - Runs the api call and reloads the case
 */
export function AddNoteCard({ caso, mutate }: { caso: Caso; mutate: Mutate }) {
    const [note, setNote] = useState('')
    const { busy, error, run } = useAction()

    return (
        <Card title="Agregar nota" icon={<PencilIcon />} tone="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                aria-label="Nueva nota de seguimiento"
                placeholder="Visitas, entrevistas, canalizaciones..."
                className="input-field w-full resize-y rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <button
                type="button"
                disabled={!note.trim() || busy}
                onClick={async () => {
                    if (await run(() => mutate(() => addNote2Case(caso.id_caso, note.trim())))) setNote('')
                }}
                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
                {busy ? 'Guardando…' : 'Guardar nota'}
            </button>
        </Card>
    )
}

/**
 * Card with the folio, dates and counters of the case; it only informs, the editable data lives in CaseEditCard
 *
 * @param caso - Case shown
 * @param reports - Reports of the case
 */
export function MetadataCard({ caso, reports }: { caso: Caso; reports: Reporte[] }) {
    return (
        <Card title="Metadatos" icon={<InfoIcon />} tone="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <dl className="flex flex-col gap-2 text-sm">
                {[
                    ['Folio', caseFolio(caso)],
                    ['Creado', formatDateTime(caso.fecha_caso)],
                    ['Reportes asociados', String(reports.length)],
                    ['Coordenadas', hasValidLocation(caso.ubicacion) ? `${caso.ubicacion.lat.toFixed(5)}, ${caso.ubicacion.lng.toFixed(5)}` : 'No disponibles'],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                        <dt className="font-diffuse">{label}</dt>
                        <dd className="text-right font-medium font-clear">{value}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    )
}
