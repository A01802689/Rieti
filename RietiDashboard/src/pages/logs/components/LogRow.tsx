import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { ENTITY_LABELS, type Log } from '@/lib/types/Log'
import { formatDateTime } from '@/lib/utilities/reportStyles'
import { LogDetail } from './LogDetail'

/** Number of columns of the table, which the detail row spans */
const COLUMNS = 6

interface LogRowProps {
    /** Log shown */
    log: Log
    /** Whether the detail of the log is open */
    expanded: boolean
    /** Called when the detail button is clicked */
    onToggle: () => void
}

/** Row of a log with a button that opens a second row with the data before and after the change */
export function LogRow({ log, expanded, onToggle }: LogRowProps) {
    return (
        <>
            <tr className="border-t border-card transition-colors hover:bg-component">
                <td className="w-10 px-2 py-3">
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Ocultar detalle' : 'Ver detalle'}
                        className="cursor-pointer rounded-lg p-1 font-diffuse outline-none hover:bg-component focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {expanded ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                    </button>
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap font-clear">{formatDateTime(log.fecha)}</td>
                <td className="px-3 py-3 text-sm font-clear">{log.usuario}</td>
                <td className="px-3 py-3 text-sm">
                    <span className="inline-block rounded-full border border-card bg-component px-2.5 py-0.5 font-clear">{log.action}</span>
                </td>
                <td className="px-3 py-3 text-sm">
                    <span className="inline-block rounded-full border border-card bg-component px-2.5 py-0.5 font-accent">
                        {ENTITY_LABELS[log.entity_type]}
                    </span>
                </td>
                <td className="px-3 py-3 font-mono text-sm font-clear">#{log.id_registro_afectado}</td>
            </tr>
            {expanded && (
                <tr className="border-t border-card bg-component">
                    <td colSpan={COLUMNS} className="p-0">
                        {/* sticky and as wide as the visible table, so on a phone the data is read without scrolling sideways */}
                        <div className="sticky left-0 w-[100cqw] p-3 sm:p-4">
                            <LogDetail before={log.before_data} after={log.after_data} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}
