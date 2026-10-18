import type { Log } from '@/lib/types/Log'

interface DataBlockProps {
    /** Name of the block, e.g. "Antes" */
    title: string
    /** Data to show as JSON; null or empty shows a message instead */
    data: Log['before_data'] | Log['after_data']
}

/**
 * Titled block with the JSON of a record
 *
 * @param props - Title and data of the block
 */
function DataBlock({ title, data }: DataBlockProps) {
    const isEmpty = data === null || Object.keys(data).length === 0

    return (
        <section aria-label={title} className="min-w-0">
            <span className="section-label">{title}</span>
            {isEmpty ? (
                <p className="mt-1 rounded-lg border border-card bg-card p-3 font-diffuse">Sin datos</p>
            ) : (
                <pre className="mt-1 max-h-64 overflow-auto rounded-lg border border-card bg-card p-3 font-mono text-xs break-words whitespace-pre-wrap font-clear">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </section>
    )
}

interface LogDetailProps {
    /** Data of the record before the change */
    before: Log['before_data']
    /** Data of the record after the change; null when nothing is left, e.g. after a delete */
    after: Log['after_data']
}

/** Data of a record before and after the change, side by side when the room allows it */
export function LogDetail({ before, after }: LogDetailProps) {
    return (
        <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
            <DataBlock title="Antes" data={before} />
            <DataBlock title="Después" data={after} />
        </div>
    )
}
