import { useState } from 'react'
import type { BatchDeleteResult } from '@/lib/types/BatchDelete'
import type { Selection } from '@/lib/utilities/useSelection'

interface SelectionToolbarProps {
    /** Selection of the list */
    selection: Selection
    /** Deletes the picked items and returns what the API deleted and skipped; it also drops the selection and reloads the list */
    onDelete: () => Promise<BatchDeleteResult>
    /** Name of one item, e.g. "reporte" */
    singular: string
    /** Name of several items, e.g. "reportes" */
    plural: string
    /** Why the API can skip an item, shown when some were skipped, e.g. "ya no existen o no están rechazados" */
    skippedReason: string
}

/** Classes of the buttons of the toolbar */
const buttonClass = 'rounded-lg px-4 py-2 text-sm'

/** Top right controls of a list that deletes in batches: start or cancel the selection, delete with an inline confirmation and tell what was skipped */
export function SelectionToolbar({ selection, onDelete, singular, plural, skippedReason }: SelectionToolbarProps) {
    const [confirming, setConfirming] = useState(false)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const count = selection.ids.length
    const noun = count === 1 ? singular : plural

    // the confirmation makes no sense without a selection (state adjusted while rendering, it does not loop)
    if (confirming && (!selection.active || count === 0)) setConfirming(false)

    /** Turns the selection mode on, forgetting the message of the last deletion */
    const start = () => {
        setMessage('')
        setError('')
        selection.start()
    }

    /** Leaves the selection mode and drops the picked items */
    const cancel = () => {
        setConfirming(false)
        setError('')
        selection.clear()
    }

    /** Deletes the picked items and tells which ones were skipped */
    const confirm = async () => {
        setBusy(true)
        setError('')
        try {
            const { omitidos } = await onDelete()
            setConfirming(false)
            if (omitidos.length > 0) {
                const skipped = omitidos.length === 1 ? singular : plural
                setMessage(`${omitidos.length} ${skipped} no se ${omitidos.length === 1 ? 'pudo' : 'pudieron'} eliminar (${skippedReason})`)
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo completar la eliminación')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
                {selection.active && (
                    <button
                        type="button"
                        disabled={count === 0 || busy}
                        onClick={() => setConfirming((v) => !v)}
                        aria-expanded={confirming}
                        className={`btn-danger ${buttonClass} font-medium disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        Eliminar ({count})
                    </button>
                )}
                <button
                    type="button"
                    disabled={busy}
                    onClick={selection.active ? cancel : start}
                    className={`btn-secondary ${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {selection.active ? 'Cancelar' : 'Seleccionar'}
                </button>
            </div>

            {confirming && (
                <div
                    role="group"
                    aria-label="Confirmar eliminación"
                    className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="p-0">
                        ¿Eliminar {count} {noun}? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                        <button type="button" disabled={busy} onClick={confirm} className={`btn-danger ${buttonClass} font-medium disabled:opacity-50`}>
                            Sí, eliminar
                        </button>
                        <button type="button" disabled={busy} onClick={() => setConfirming(false)} className={`btn-secondary ${buttonClass}`}>
                            No eliminar
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <p className="rounded-lg bg-component p-3 text-sm" role="status">
                    {message}
                </p>
            )}
            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </div>
    )
}
