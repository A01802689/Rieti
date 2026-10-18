import { LockKeyhole } from 'lucide-react'
import { Unavailable } from './Unavailable'

interface ForbiddenProps {
    /** Classes merged over the card; use them to set its height */
    className?: string
}

/** Card that tells the user cannot see the information they asked for; it is shown when the API answers 403, so the page is not left empty */
export function Forbidden({ className }: ForbiddenProps) {
    return <Unavailable message="No tienes permiso para ver esta información" icon={LockKeyhole} className={className} />
}
