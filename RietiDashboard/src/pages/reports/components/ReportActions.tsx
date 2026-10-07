import { useState } from 'react';
import type { Reporte } from '@/lib/types/Report';
import type { Caso } from '@/lib/types/Case';
import { cases } from '@/lib/api/cases';
import { acceptReport, mergeReport, rejectReport } from '@/lib/api/workflow';
import { isAdmin, useRole } from '@/lib/utilities/useRole';

type Mode = 'idle' | 'merge' | 'reject';

// open cases first, same colonia first
function mergeCandidates(report: Reporte): Caso[] {
    return cases
        .filter((c) => c.estado !== 'Cerrado')
        .sort((a, b) => {
            const sameA = a.ubicacion.colonia === report.ubicacion.colonia ? 0 : 1;
            const sameB = b.ubicacion.colonia === report.ubicacion.colonia ? 0 : 1;
            return sameA - sameB || a.id_caso - b.id_caso;
        });
}

interface Props {
    report: Reporte;
    onAccepted: (caseId: number) => void;
}

// Triage controls: only for reports that do not have a case yet. Admin only.
export function ReportActions({ report, onAccepted }: Props) {
    const role = useRole();
    const [mode, setMode] = useState<Mode>('idle');
    const [targetCase, setTargetCase] = useState('');

    if (report.estatus_seguimiento === 'Rechazado') {
        return <p className="rounded-lg bg-component font-diffuse">Este reporte fue rechazado.</p>;
    }
    if (report.id_caso !== null) {
        return (
            <p className="rounded-lg bg-component font-diffuse">
                Este reporte ya fue canalizado al caso #{report.id_caso}.
            </p>
        );
    }

    if (!isAdmin(role)) {
        return (
            <p className="rounded-lg bg-component font-diffuse">
                Solo un administrador puede aceptar, fusionar o rechazar reportes.
            </p>
        );
    }

    const candidates = mergeCandidates(report);
    const close = () => {
        setMode('idle');
        setTargetCase('');
    };

    return (
        <div className="flex flex-col gap-3 border-t border-card pt-4">
            <h2 className="p-0 text-base">Gestionar reporte</h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                    type="button"
                    onClick={() => onAccepted(acceptReport(report.id_reporte))}
                    className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                >
                    Aceptar y crear caso
                </button>
                <button
                    type="button"
                    onClick={() => setMode(mode === 'merge' ? 'idle' : 'merge')}
                    aria-expanded={mode === 'merge'}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm"
                >
                    Fusionar con un caso
                </button>
                <button
                    type="button"
                    onClick={() => setMode(mode === 'reject' ? 'idle' : 'reject')}
                    aria-expanded={mode === 'reject'}
                    className="btn-secondary rounded-lg px-4 py-2 text-sm"
                >
                    Rechazar
                </button>
            </div>

            {mode === 'merge' && (
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
                                        Caso #{c.id_caso} · {c.ubicacion.colonia} · {c.estado}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={!targetCase}
                                onClick={() => {
                                    mergeReport(report.id_reporte, Number(targetCase));
                                    close();
                                }}
                                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirmar fusión
                            </button>
                        </>
                    )}
                </div>
            )}

            {mode === 'reject' && (
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="p-0">¿Rechazar este reporte? No se creará ningún caso.</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                rejectReport(report.id_reporte);
                                close();
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
    );
}
