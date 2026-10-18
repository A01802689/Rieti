import { Ban, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utilities/utils'

interface UnavailableProps {
    /** Text shown under the icon, e.g. "Ubicación no disponible" */
    message: string
    /** Classes merged over the card; use them to set its height */
    className?: string
    /** Icon above the message */
    icon?: LucideIcon
}

/** Card that tells something is not available (a location, a photo...), with an icon and a message */
export function Unavailable({ message, className, icon: Icon = Ban }: UnavailableProps) {
    return (
        <div className={cn('flex w-full flex-col items-center justify-center gap-2 rounded-lg bg-component p-4 text-center', className)}>
            <Icon className="size-8 font-diffuse" aria-hidden />
            <p className="p-0 font-medium font-diffuse">{message}</p>
        </div>
    )
}
