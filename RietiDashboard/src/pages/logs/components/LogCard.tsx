import { useState } from 'react';
import type { Log } from '@/lib/types/Log';
import { formatDateTime } from '@/lib/utilities/reportStyles';

interface Props {
    log: Log;
}

const isEmpty = (data: Record<string, unknown>) => Object.keys(data).length === 0;

function DataBlock({ title, data }: { title: string; data: Record<string, unknown> }) {
    return (
        <div className="min-w-0 flex-1 rounded-lg bg-component p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider font-diffuse">{title}</p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">
                {isEmpty(data) ? '—' : JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export function LogCard({ log }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <article className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-mono text-lg font-bold font-accent">Log #{log.id_logs}</h2>
                        <span className="rounded-full bg-component px-3 py-1 text-sm font-medium capitalize">
                            {log.entity_type} #{log.id_registro_afectado}
                        </span>
                    </div>
                    <p className="mt-3 font-semibold">{log.action}</p>
                    <p className="font-diffuse">
                        {log.usuario} · {formatDateTime(log.fecha)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    className="btn-secondary shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
                >
                    {open ? 'Ocultar cambios' : 'Ver cambios'}
                </button>
            </div>

            {open && (
                <div className="flex flex-col gap-3 sm:flex-row">
                    <DataBlock title="Antes" data={log.before_data} />
                    <DataBlock title="Después" data={log.after_data} />
                </div>
            )}
        </article>
    );
}
