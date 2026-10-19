import { useState } from 'react'
import type { Caso, UbicacionCasoPatch } from '@/lib/types/Case'
import { Popup } from '@/components/layout/Popup'
import { LocationMap } from '@/components/ui/LocationMap'
import { Empty, Field } from '@/components/ui/ReportDetails'
import { hasValidLocation } from '@/lib/utilities/location'
import { useAuth } from '@/context/auth'
import { useAction } from '@/lib/utilities/useAction'
import type { UpdateCase } from '../useCases'
import { PinIcon } from './CaseIcons'
import { Card } from './CaseInfo'
import { CaseLocationForm } from './CaseLocationForm'

interface Props {
    /** Case shown */
    caso: Caso
    /** Applies the change of location to the case and reloads it */
    update: UpdateCase
}

/** Card with the location of the case: colonia, calle and a map, or a notice when it has none; only users who can edit cases get the button that opens the selector to add or edit it */
export function CaseLocationCard({ caso, update }: Props) {
    const { can } = useAuth()
    const [editing, setEditing] = useState(false)
    const { busy, error, run, clearError } = useAction()
    const { ubicacion } = caso
    const hasLocation = hasValidLocation(ubicacion) || ubicacion.colonia !== null || ubicacion.calle !== null
    const actionLabel = hasLocation ? 'Editar ubicación' : 'Agregar ubicación'

    /** Closes the selector without saving, unless a save is running */
    const close = () => {
        if (busy) return
        setEditing(false)
        clearError()
    }

    /**
     * Saves the location of the form and closes the selector if it worked
     *
     * @param location - Fields with a value: colonia, calle and the point
     */
    const save = async (location: UbicacionCasoPatch) => {
        const saved = await run(async () => {
            if (location.lat !== undefined && !hasValidLocation(location)) {
                throw new Error('Las coordenadas del marcador no son válidas')
            }
            await update({ ubicacion: location })
        })
        if (saved) setEditing(false)
    }

    return (
        <Card
            title="Ubicación del caso"
            icon={<PinIcon />}
            tone="bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
            action={
                can('cases.edit') ? (
                    <button type="button" onClick={() => setEditing(true)} className="btn-secondary rounded-lg px-3 py-1.5 text-sm">
                        {actionLabel}
                    </button>
                ) : undefined
            }
        >
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Colonia">{ubicacion.colonia ?? <Empty text="Sin dato" />}</Field>
                <Field label="Calle">{ubicacion.calle ?? <Empty text="Sin dato" />}</Field>
            </dl>

            <LocationMap lat={ubicacion.lat} lng={ubicacion.lng} />

            <Popup
                open={editing}
                onClose={close}
                title={actionLabel}
                description="Haz clic en el mapa o busca un lugar para colocar el marcador"
            >
                <CaseLocationForm caso={caso} busy={busy} error={error} onSave={save} onCancel={close} />
            </Popup>
        </Card>
    )
}
