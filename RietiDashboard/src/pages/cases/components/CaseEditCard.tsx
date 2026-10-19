import { useId, useState } from 'react'
import type { Caso, CaseUrgency, CasoPatch } from '@/lib/types/Case'
import { CASE_URGENCIES } from '@/lib/types/Case'
import {
    CANTIDAD_NNA,
    EDAD_APROXIMADA,
    WORK_TYPES,
    type CantidadNNA,
    type EdadAproximada,
    type TipoTrabajo,
} from '@/lib/types/Report'
import { Empty, Field } from '@/components/ui/ReportDetails'
import { SelectField } from '@/components/ui/SelectField'
import { URGENCY_STYLES } from '@/lib/utilities/reportStyles'
import { useAuth } from '@/context/auth'
import { useAction } from '@/lib/utilities/useAction'
import type { SaveChanges } from '../useCases'
import { TagIcon } from './CaseIcons'
import { Card } from './CaseInfo'

/** Values the user changed in the form; a missing one keeps the value of the case */
interface Draft {
    cantidad_nna?: CantidadNNA
    edad_aproximada?: EdadAproximada
    tipo_trabajo?: TipoTrabajo
    /** The urgency cannot be cleared, so a chosen one is never null */
    urgencia?: NonNullable<CaseUrgency>
    /** Text of the note, as typed */
    notas?: string
}

/**
 * Compares the form with the case to know what has to be sent
 *
 * @param caso - Case as it is now
 * @param draft - Values changed in the form
 * @returns `patch`, only the fields of the case that differ, and `note`, the trimmed text of a new note (null when it did not change or is empty)
 */
function changesOf(caso: Caso, draft: Draft) {
    const patch: CasoPatch = {}
    if (draft.cantidad_nna !== undefined && draft.cantidad_nna !== caso.cantidad_nna) patch.cantidad_nna = draft.cantidad_nna
    if (draft.edad_aproximada !== undefined && draft.edad_aproximada !== caso.edad_aproximada) patch.edad_aproximada = draft.edad_aproximada
    if (draft.tipo_trabajo !== undefined && draft.tipo_trabajo !== caso.tipo_trabajo) patch.tipo_trabajo = draft.tipo_trabajo
    if (draft.urgencia !== undefined && draft.urgencia !== caso.urgencia) patch.urgencia = draft.urgencia

    const text = draft.notas?.trim() ?? ''
    const note = text !== '' && text !== (caso.notas ?? '').trim() ? text : null
    return { patch, note }
}

interface Props {
    /** Case shown */
    caso: Caso
    /** Saves the changed fields and the note in one batch and reloads the case */
    saveChanges: SaveChanges
}

/** Card with the data of the case that can be edited (minors, age, work type, urgency and last note); only users who can edit cases get the edit button and its form */
export function CaseEditCard({ caso, saveChanges }: Props) {
    const { can } = useAuth()
    const noteId = useId()
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState<Draft>({})
    const { busy: saving, error, run, clearError } = useAction()
    const { patch, note } = changesOf(caso, draft)
    const changed = Object.keys(patch).length > 0 || note !== null

    /**
     * Stores a value of the form
     *
     * @param key - Field changed
     * @param value - New value of the field
     */
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))

    /** Leaves the form and forgets what was typed */
    const close = () => {
        setEditing(false)
        setDraft({})
        clearError()
    }

    /** Saves the changed fields and the note, and closes the form if it worked */
    const save = async () => {
        if (await run(() => saveChanges({ patch, nota: note }))) close()
    }

    return (
        <Card
            title="Clasificación del caso"
            icon={<TagIcon />}
            tone="bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"
            action={
                can('cases.edit') && !editing ? (
                    <button type="button" onClick={() => setEditing(true)} className="btn-secondary rounded-lg px-3 py-1.5 text-sm">
                        Editar
                    </button>
                ) : undefined
            }
        >
            {editing ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        save()
                    }}
                    className="flex flex-col gap-4"
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SelectField
                            label="Cantidad de niños"
                            value={draft.cantidad_nna ?? caso.cantidad_nna}
                            options={CANTIDAD_NNA}
                            onChange={(value) => set('cantidad_nna', value)}
                        />
                        <SelectField
                            label="Edad aproximada"
                            value={draft.edad_aproximada ?? caso.edad_aproximada}
                            options={EDAD_APROXIMADA}
                            onChange={(value) => set('edad_aproximada', value)}
                        />
                        <SelectField
                            label="Tipo de trabajo"
                            value={draft.tipo_trabajo ?? caso.tipo_trabajo}
                            options={WORK_TYPES}
                            onChange={(value) => set('tipo_trabajo', value)}
                        />
                        <SelectField
                            label="Urgencia"
                            value={draft.urgencia ?? caso.urgencia}
                            options={CASE_URGENCIES}
                            placeholder="Sin urgencia"
                            onChange={(value) => set('urgencia', value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor={noteId} className="text-sm font-clear">
                            Nota
                        </label>
                        <textarea
                            id={noteId}
                            value={draft.notas ?? caso.notas ?? ''}
                            onChange={(e) => set('notas', e.target.value)}
                            rows={4}
                            className="input-field w-full resize-y rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="p-0 text-xs font-diffuse">
                            Una nota nueva se agrega como un seguimiento más; las anteriores no se modifican
                        </p>
                    </div>

                    {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={close}
                            className="btn-secondary rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!changed || saving}
                            className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        <Field label="Niños">{caso.cantidad_nna}</Field>
                        <Field label="Edad aproximada">{caso.edad_aproximada}</Field>
                        <Field label="Tipo de trabajo">{caso.tipo_trabajo}</Field>
                        <Field label="Urgencia">
                            {caso.urgencia ? (
                                <span className={URGENCY_STYLES[caso.urgencia]}>{caso.urgencia}</span>
                            ) : (
                                <Empty text="Sin urgencia" />
                            )}
                        </Field>
                    </dl>

                    <div className="flex flex-col gap-2">
                        <p className="section-label p-0">Última nota</p>
                        <div className="rounded-lg bg-component px-4 py-3">
                            <p className="p-0 text-sm whitespace-pre-line">{caso.notas || <Empty text="Sin notas" />}</p>
                        </div>
                    </div>
                </>
            )}
        </Card>
    )
}
