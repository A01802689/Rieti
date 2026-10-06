import type { Caso } from '@/lib/types/Case';
import { timelineOf } from '@/lib/utilities/caseTimeline';
import { formatDateTime } from '@/lib/utilities/reportStyles';
import { Card } from './CaseInfo';

export function CaseTimeline({ caso }: { caso: Caso }) {
    const entries = timelineOf(caso);

    return (
        <Card title="Folios de seguimiento" icon="+" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <ol className="flex flex-col">
                {entries.map((entry, i) => (
                    <li key={entry.folio} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-blue-600 bg-card text-sm font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400">
                                {i + 1}
                            </span>
                            {i < entries.length - 1 && <span className="w-px flex-1 bg-slate-300 dark:bg-slate-600" aria-hidden />}
                        </div>
                        <div className="min-w-0 flex-1 pb-6">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="font-mono text-sm font-bold font-accent">{entry.folio}</span>
                                <span className="text-sm font-diffuse">{formatDateTime(entry.fecha)}</span>
                                <span className="rounded-full bg-component px-3 py-0.5 text-xs font-clear">{entry.tipo}</span>
                            </div>
                            <p className="p-0 pt-1 text-xs font-diffuse">{entry.autor}</p>
                            {entry.nota && <p className="p-0 pt-1 text-sm">{entry.nota}</p>}
                        </div>
                    </li>
                ))}
            </ol>
        </Card>
    );
}
