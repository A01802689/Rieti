import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Caso, CaseState } from '@/lib/types/Case';
import type { Reporte } from '@/lib/types/Report';
import { setCaseState, transferCase } from '@/lib/api/workflow';
import { caseFolio } from '@/lib/utilities/caseTimeline';
import { URGENCY_STYLES, formatDateTime, statusStyle } from '@/lib/utilities/reportStyles';
import { roleLabel, useRole } from '@/lib/utilities/useRole';

/** States a case can move to */
const STATES: CaseState[] = ['Abierto', 'En desarrollo', 'Cerrado'];
// TODO: load from the API (municipios endpoint)
const MUNICIPIOS = ['Atizapán de Zaragoza', 'Naucalpan de Juárez', 'Tlalnepantla de Baz', 'Nicolás Romero', 'Cuautitlán Izcalli'];

/**
 * Describes who started the case
 *
 * @param first - First report of the case
 */
function origin(first: Reporte | undefined) {
    if (!first) return 'Sin reporte asociado';
    return first.id_usuario === null ? 'Reporte ciudadano anónimo' : `Reporte del usuario #${first.id_usuario}`;
}

/**
 * Header of the case page: folio, state, urgency, origin and the controls to change the state or transfer it
 *
 * @param caso - Case shown
 * @param firstReport - Oldest report of the case, used to describe the origin
 */
export function CaseHeader({ caso, firstReport }: { caso: Caso; firstReport: Reporte | undefined }) {
    const navigate = useNavigate();
    const autor = roleLabel(useRole());
    const [transferring, setTransferring] = useState(false);
    const [target, setTarget] = useState('');
    const style = statusStyle(caso.estado);

    const destinations = MUNICIPIOS.filter((m) => m !== caso.municipio.nombre);

    return (
        <header className="flex flex-col gap-4 rounded-xl border border-card bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <button type="button" onClick={() => navigate('/case')} className="text-sm font-diffuse hover:underline">
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
                        <span className={`text-sm font-medium ${URGENCY_STYLES[caso.urgencia] ?? 'font-diffuse'}`}>
                            Urgencia {caso.urgencia.toLowerCase()}
                        </span>
                    </div>
                    <p className="font-sight p-0 pt-1">
                        {caso.ubicacion.colonia} · {formatDateTime(caso.fecha_caso)} ·{' '}
                        <span className="font-clear">Origen: {origin(firstReport)}</span>
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                    <button
                        type="button"
                        onClick={() => setTransferring((v) => !v)}
                        aria-expanded={transferring}
                        className="btn-transfer rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        → Transferir a municipio
                    </button>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Estado del caso">
                        {STATES.map((state) => (
                            <button
                                key={state}
                                type="button"
                                aria-pressed={caso.estado === state}
                                onClick={() => caso.estado !== state && setCaseState(caso.id_caso, state, autor)}
                                className={`rounded-full px-4 py-2 text-sm ${
                                    caso.estado === state ? 'btn-primary font-medium' : 'btn-secondary'
                                }`}
                            >
                                {state}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {transferring && (
                <div className="flex flex-col gap-2 rounded-lg bg-component p-3 sm:flex-row sm:items-center">
                    <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        aria-label="Municipio destino"
                        className="select-field sm:flex-1"
                    >
                        <option value="">Selecciona un municipio…</option>
                        {destinations.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={!target}
                        onClick={() => {
                            transferCase(caso.id_caso, target, autor);
                            setTransferring(false);
                            setTarget('');
                        }}
                        className="btn-transfer rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Confirmar transferencia
                    </button>
                </div>
            )}
        </header>
    );
}
