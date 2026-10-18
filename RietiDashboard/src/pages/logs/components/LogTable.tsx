import type { Log } from '@/lib/types/Log'
import { LogRow } from './LogRow'

/** Titles of the data columns, after the one with the detail button */
const HEADERS = ['Fecha', 'Usuario', 'Acción', 'Entidad', 'ID del registro']

interface LogTableProps {
    /** Logs shown, one row each */
    logs: Log[]
    /** Id of the log whose detail is open, if any */
    expandedId: number | null
    /** Called with the id of the log whose detail button was clicked */
    onToggle: (id: number) => void
}

/** Table of logs that scrolls sideways when the screen is narrow; each row can open its data before and after the change */
export function LogTable({ logs, expandedId, onToggle }: LogTableProps) {
    return (
        <div className="@container overflow-x-auto rounded-xl border border-card bg-card shadow-sm">
            <table className="w-full min-w-160 border-collapse text-left">
                <caption className="sr-only">Registro de actividad del sistema</caption>
                <thead className="bg-component">
                    <tr>
                        <th scope="col" className="w-10 px-2 py-3">
                            <span className="sr-only">Detalle</span>
                        </th>
                        {HEADERS.map((header) => (
                            <th key={header} scope="col" className="section-label px-3 py-3 whitespace-nowrap">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <LogRow
                            key={log.id_logs}
                            log={log}
                            expanded={expandedId === log.id_logs}
                            onToggle={() => onToggle(log.id_logs)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
