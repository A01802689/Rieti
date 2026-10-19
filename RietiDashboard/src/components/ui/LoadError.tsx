interface LoadErrorProps {
    /** Explains which information could not be loaded */
    message: string
    /** Starts another request when the user retries */
    onRetry?: () => void
}

/** Shows a load failure and a retry action instead of presenting missing data as an empty result */
export function LoadError({ message, onRetry }: LoadErrorProps) {
    return (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-card p-5 text-red-700 dark:text-red-300">
            <p className="p-0">{message}</p>
            {onRetry && (
                <button type="button" onClick={onRetry} className="btn-secondary rounded-lg px-4 py-2 text-sm">
                    Reintentar
                </button>
            )}
        </div>
    )
}
