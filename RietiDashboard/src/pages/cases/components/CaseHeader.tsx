import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Caso, CaseState } from '@/lib/types/Case'
import type { Municipio } from '@/lib/types/Municipio'
import type { Reporte } from '@/lib/types/Report'
import { transferCase } from '@/lib/api/cases'
import { getMunicipios } from '@/lib/api/municipios'
import { Empty } from '@/components/ui/ReportDetails'
import { useAuth } from '@/context/auth'
import { caseFolio } from '@/lib/utilities/caseTimeline'
import { URGENCY_STYLES, formatDateTime, statusStyle } from '@/lib/utilities/reportStyles'
import { useAction } from '@/lib/utilities/useAction'
import type { Mutate, UpdateCase } from '../useCases'

/** States a case can move to, each with the permission that moving the case there needs */
const STATES: { state: CaseState; permission: 'cases.edit' | 'cases.close' }[] = [
    { state: 'Abierto', permission: 'cases.edit' },
    { state: 'En desarrollo', permission: 'cases.edit' },
    { state: 'Cerrado', permission: 'cases.close' },
]

/**
 * Describes who started the case
 *
 * @param first - First report of the case
 * @returns The text shown as origin
 */
function origin(first: Reporte | undefined) {
    if (!first) return 'Sin reporte asociado'
    return first.id_usuario === null ? 'Reporte ciudadano anónimo' : `Reporte del usuario #${first.id_usuario}`
}

interface Props {
    /** Case shown */
    caso: Caso
    /** Oldest report of the case, used to describe the origin */
    firstReport: Reporte | undefined
    /** Runs an api call and reloads the case */
    mutate: Mutate
    /** Applies one change to the case, e.g. its state, and reloads it */
    update: UpdateCase
}

/** Header of the case page: folio, state, urgency, origin and the controls to change the state (each state needs its permission) or transfer it to a municipio of the API (needs the assign permission) */
export function CaseHeader({ caso, firstReport, mutate, update }: Props) {
    const navigate = useNavigate()
    const { can, canAny } = useAuth()
    const [transferring, setTransferring] = useState(false)
    const [municipios, setMunicipios] = useState<Municipio[]>()
    // id_municipio of the destination, as the text of the select
    const [target, setTarget] = useState('')
    const { busy, error, run } = useAction()
    const style = statusStyle(caso.estado)
    // with no state the user can move the case to, the state shows only as the badge above
    const stateButtons = canAny('cases.edit', 'cases.close')

    const destinations = (municipios ?? [])
        .filter((m) => m.nombre !== caso.municipio.nombre)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    /** Opens or closes the transfer step, loading the municipios the first time it opens */
    const toggleTransfer = async () => {
        if (transferring) return setTransferring(false)
        setTransferring(true)
        if (municipios === undefined) await run(async () => setMunicipios(await getMunicipios()))
    }

    return (
        <header className="flex flex-col gap-4 rounded-xl border border-card bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <button type="button" onClick={() => navigate('/cases')} className="text-sm font-diffuse hover:underline">
                        ← Volver
                    </button>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        <h1 className="p-0 text-2xl font-semibold sm:text-3xl">{caseFolio(caso)}</h1>
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${style.pill}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                            {caso.estado}
                        </span>
                        <span className={`text-sm font-medium ${URGENCY_STYLES[caso.urgencia ?? ''] ?? 'font-diffuse'}`}>
                            {caso.urgencia ? `Urgencia ${caso.urgencia.toLowerCase()}` : 'Sin urgencia'}
                        </span>
                    </div>
                    <p className="font-sight p-0 pt-1">
                        {caso.ubicacion.colonia ?? <Empty text="Sin dato" />} · {formatDateTime(caso.fecha_caso)} ·{' '}
                        <span className="font-clear">Origen: {origin(firstReport)}</span>
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                    {can('cases.assign') && (
                        <button
                            type="button"
                            onClick={toggleTransfer}
                            aria-expanded={transferring}
                            className="btn-transfer rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            → Transferir a municipio
                        </button>
                    )}
                    {stateButtons && (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Estado del caso">
                            {STATES.map(({ state, permission }) => (
                                <button
                                    key={state}
                                    type="button"
                                    disabled={busy || !can(permission)}
                                    aria-pressed={caso.estado === state}
                                    title={can(permission) ? undefined : 'No tienes permiso para mover el caso a este estado'}
                                    onClick={() => caso.estado !== state && run(() => update({ estado: state }))}
                                    className={`rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                                        caso.estado === state ? 'btn-primary font-medium' : 'btn-secondary'
                                    }`}
                                >
                                    {state}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {transferring && can('cases.assign') && (
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center">
                    <select
                        value={target}
                        disabled={municipios === undefined}
                        onChange={(e) => setTarget(e.target.value)}
                        aria-label="Municipio destino"
                        className="select-field sm:flex-1"
                    >
                        <option value="">
                            {municipios === undefined
                                ? busy ? 'Cargando municipios…' : 'No se pudieron cargar los municipios'
                                : 'Selecciona un municipio…'}
                        </option>
                        {destinations.map((m) => (
                            <option key={m.id_municipio} value={m.id_municipio}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={!target || busy}
                        onClick={async () => {
                            if (await run(() => mutate(() => transferCase(caso.id_caso, Number(target))))) {
                                setTransferring(false)
                                setTarget('')
                            }
                        }}
                        className="btn-transfer rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Confirmar transferencia
                    </button>
                </div>
            )}

            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </header>
    )
}
