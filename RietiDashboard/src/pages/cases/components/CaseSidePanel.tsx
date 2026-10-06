import { InfoIcon, PencilIcon } from './CaseIcons';
import { useState } from 'react';
import type { Caso, CaseUrgency } from '@/lib/types/Case';
import type { Reporte } from '@/lib/types/Report';
import { addCaseNote, setCaseUrgency } from '@/lib/api/workflow';
import { caseFolio } from '@/lib/utilities/caseTimeline';
import { formatDateTime } from '@/lib/utilities/reportStyles';
import { isAdmin, roleLabel, useRole } from '@/lib/utilities/useRole';
import { Card } from './CaseInfo';

const URGENCIES: CaseUrgency[] = ['Baja', 'Media', 'Alta'];

export function AddNoteCard({ caso }: { caso: Caso }) {
    const autor = roleLabel(useRole());
    const [note, setNote] = useState('');

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
            <button
                type="button"
                disabled={!note.trim()}
                onClick={() => {
                    addCaseNote(caso.id_caso, note.trim(), autor);
                    setNote('');
                }}
                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
                Guardar nota
            </button>
        </Card>
    );
}

export function MetadataCard({ caso, reports }: { caso: Caso; reports: Reporte[] }) {
    const role = useRole();

    return (
        <Card title="Metadatos" icon={<InfoIcon />} tone="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <dl className="flex flex-col gap-2 text-sm">
                {[
                    ['Folio', caseFolio(caso)],
                    ['Creado', formatDateTime(caso.fecha_caso)],
                    ['Reportes asociados', String(reports.length)],
                    ['Coordenadas', `${caso.ubicacion.lat.toFixed(5)}, ${caso.ubicacion.lng.toFixed(5)}`],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                        <dt className="font-diffuse">{label}</dt>
                        <dd className="text-right font-medium font-clear">{value}</dd>
                    </div>
                ))}
            </dl>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Urgencia</p>
                {isAdmin(role) ? (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Urgencia del caso">
                        {URGENCIES.map((u) => (
                            <button
                                key={u}
                                type="button"
                                aria-pressed={caso.urgencia === u}
                                onClick={() => setCaseUrgency(caso.id_caso, u)}
                                className={`rounded-full px-4 py-1.5 text-sm ${
                                    caso.urgencia === u ? 'btn-primary font-medium' : 'btn-secondary'
                                }`}
                            >
                                {u}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="p-0 text-sm font-diffuse">{caso.urgencia} · solo un administrador puede cambiarla.</p>
                )}
            </div>
        </Card>
    );
}
