import { useState } from 'react'
import type { Reporte } from '@/lib/types/Report'
import type { Caso } from '@/lib/types/Case'
import { getCases } from '@/lib/api/cases'
import { acceptReport, declineReport, fuseReport, reopenReport } from '@/lib/api/reports'
import { useAuth } from '@/context/auth'
import { useAction } from '@/lib/utilities/useAction'

/** Step of the triage controls */
type Mode = 'idle' | 'merge' | 'reject'

/**
 * Lists the cases a report can be merged into: open ones only, the same colonia first
 *
 * @param report - Report to merge
 * @param cases - All the cases
 * @returns The open cases, sorted
 */
function mergeCandidates(report: Reporte, cases: Caso[]): Caso[] {
    return cases
        .filter((c) => c.estado !== 'Cerrado')
        .sort((a, b) => {
            const sameA = a.ubicacion.colonia === report.ubicacion.colonia ? 0 : 1
            const sameB = b.ubicacion.colonia === report.ubicacion.colonia ? 0 : 1
            return sameA - sameB || a.id_caso - b.id_caso
        })
}

interface Props {
    /** Report to triage */
    report: Reporte
    /** Called with the id of the new case when the report is accepted, only if the user can see cases */
    onAccepted: (caseId: number) => void
    /** Called after any action finishes, so the parent reloads the report */
    onChanged: () => void
}

/** Triage controls for reports without a case, each one shown to the users with its permission (accept: edit reports, merge: edit reports and see cases, reject: close reports), and the reopen button for rejected ones, which only an admin has */
export function ReportActions({ report, onAccepted, onChanged }: Props) {
    const { isAdmin, can, canAny } = useAuth()
    const [mode, setMode] = useState<Mode>('idle')
    const [targetCase, setTargetCase] = useState('')
    const [cases, setCases] = useState<Caso[]>()
    const { busy, error, run } = useAction()

    if (report.estatus_seguimiento === 'Rechazado') {
        if (!isAdmin) {
            return <p className="rounded-lg bg-component font-diffuse">Este reporte fue rechazado.</p>
        }
        return (
            <div className="flex flex-col gap-2 border-t border-card pt-4">
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="p-0 font-diffuse">Este reporte fue rechazado.</p>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                            if (await run(() => reopenReport(report.id_reporte))) onChanged()
                        }}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reabrir reporte
                    </button>
                </div>
                {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            </div>
        )
    }

    if (report.id_caso !== null) {
        return (
            <p className="rounded-lg bg-component font-diffuse">
                Este reporte ya fue canalizado al caso #{report.id_caso}.
            </p>
        )
    }

    const canAccept = can('reports.edit')
    const canMerge = canAccept && can('cases.view')
    const canReject = can('reports.close')

    if (!canAny('reports.edit', 'reports.close')) {
        return (
            <p className="rounded-lg bg-component font-diffuse">
                No tienes permiso para gestionar este reporte.
            </p>
        )
    }

    const candidates = mergeCandidates(report, cases ?? [])
    /** Goes back to the first step and clears the chosen case */
    const close = () => {
        setMode('idle')
        setTargetCase('')
    }

    /** Opens the merge step, loading the cases the first time */
    const openMerge = async () => {
        if (mode === 'merge') return setMode('idle')
        setMode('merge')
        if (cases === undefined) await run(async () => setCases(await getCases()))
    }

    return (
        <div className="flex flex-col gap-3 border-t border-card pt-4">
            <h2 className="p-0 text-base">Gestionar reporte</h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {canAccept && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                            let caseId = 0
                            if (await run(async () => { caseId = (await acceptReport(report.id_reporte)).id_caso })) {
                                onChanged()
                                if (can('cases.view')) onAccepted(caseId)
                            }
                        }}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        Aceptar y crear caso
                    </button>
                )}
                {canMerge && (
                    <button
                        type="button"
                        onClick={openMerge}
                        aria-expanded={mode === 'merge'}
                        className="btn-secondary rounded-lg px-4 py-2 text-sm"
                    >
                        Fusionar con un caso
                    </button>
                )}
                {canReject && (
                    <button
                        type="button"
                        onClick={() => setMode(mode === 'reject' ? 'idle' : 'reject')}
                        aria-expanded={mode === 'reject'}
                        className="btn-secondary rounded-lg px-4 py-2 text-sm"
                    >
                        Rechazar
                    </button>
                )}
            </div>

            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

            {mode === 'merge' && canMerge && (
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center">
                    {candidates.length === 0 ? (
                        <p className="font-diffuse">No hay casos abiertos para fusionar.</p>
                    ) : (
                        <>
                            <select
                                value={targetCase}
                                onChange={(e) => setTargetCase(e.target.value)}
                                aria-label="Caso destino"
                                className="select-field sm:flex-1"
                            >
                                <option value="">Selecciona un caso…</option>
                                {candidates.map((c) => (
                                    <option key={c.id_caso} value={c.id_caso}>
                                        Caso #{c.id_caso} · {c.ubicacion.colonia ?? 'Sin dato'} · {c.estado}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={!targetCase || busy}
                                onClick={async () => {
                                    if (await run(() => fuseReport(report.id_reporte, Number(targetCase)))) {
                                        close()
                                        onChanged()
                                    }
                                }}
                                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirmar fusión
                            </button>
                        </>
                    )}
                </div>
            )}

            {mode === 'reject' && canReject && (
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="p-0">¿Rechazar este reporte? No se creará ningún caso.</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                                if (await run(() => declineReport(report.id_reporte))) {
                                    close()
                                    onChanged()
                                }
                            }}
                            className="btn-danger rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            Sí, rechazar
                        </button>
                        <button type="button" onClick={close} className="btn-secondary rounded-lg px-4 py-2 text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
