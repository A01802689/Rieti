import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utilities/utils'
import { useReportImage } from '@/lib/utilities/useReportImage'
import { Spinner } from './Spinner'
import { Unavailable } from './Unavailable'

interface Props {
    /** Id of the report whose photo is shown; null when the report has none */
    reportId: number | null
    /** Alternative text of the image */
    alt: string
    /** Classes of the image and its placeholders; the default sets the height */
    className?: string
}

/** Loads the photo of a report: it asks the API for the signed link and then loads the photo from it, with a spinner meanwhile and a "Sin imagen" card when there is no photo or it cannot be loaded */
export function ReportImage({ reportId, alt, className = 'h-48' }: Props) {
    const { loading: asking, url: src } = useReportImage(reportId)
    // each result is tied to the url it belongs to, so a new url starts loading again without an effect
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
    const [failedSrc, setFailedSrc] = useState<string | null>(null)

    if (asking) {
        return (
            <div className={cn('flex w-full items-center justify-center rounded-lg bg-component', className)}>
                <Spinner className="font-accent" />
            </div>
        )
    }

    if (!src || failedSrc === src) {
        return <Unavailable message="Sin imagen" icon={ImageOff} className={className} />
    }

    const loading = loadedSrc !== src

    return (
        <a href={src} target="_blank" rel="noreferrer" className="relative block">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-component">
                    <Spinner className="font-accent" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoadedSrc(src)}
                onError={() => setFailedSrc(src)}
                className={cn('w-full rounded-lg object-cover', className, loading && 'opacity-0')}
            />
        </a>
    )
}
