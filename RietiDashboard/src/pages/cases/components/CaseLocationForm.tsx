import { useId, useState } from 'react'
import type { Caso, UbicacionCaso, UbicacionCasoPatch } from '@/lib/types/Case'
import type { GeocodedPlace } from '@/lib/api/geocoding'
import { LocationPicker } from './LocationPicker'
import { hasValidLocation, type GeoPoint } from '@/lib/utilities/location'

/** Maximum length of the colonia and the calle that the API accepts */
const MAX_TEXT = 100

/** Classes of the text inputs */
const inputClass = 'input-field w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'

/**
 * Builds the location to send, with only the fields that have a value
 *
 * @param colonia - Text of the colonia field
 * @param calle - Text of the calle field
 * @param point - Point of the marker, null while none is placed
 * @returns The location, empty when nothing has a value
 */
function locationOf(colonia: string, calle: string, point: GeoPoint | null) {
    const location: UbicacionCasoPatch = {}
    if (colonia.trim()) location.colonia = colonia.trim()
    if (calle.trim()) location.calle = calle.trim()
    if (point) {
        location.lat = point.lat
        location.lng = point.lng
    }
    return location
}

/**
 * Tells if a location to send is different from the one the case has
 *
 * @param location - Location to send
 * @param current - Location of the case
 * @returns True when any field to send has another value
 */
const differs = (location: UbicacionCasoPatch, current: UbicacionCaso) =>
    (location.colonia !== undefined && location.colonia !== current.colonia) ||
    (location.calle !== undefined && location.calle !== current.calle) ||
    (location.lat !== undefined && (location.lat !== current.lat || location.lng !== current.lng))

interface Props {
    /** Case whose location is edited */
    caso: Caso
    /** Whether the save is running, which blocks the form */
    busy: boolean
    /** Message of the last failed save, empty when there is none */
    error: string
    /** Sends the location of the form */
    onSave: (location: UbicacionCasoPatch) => void
    /** Closes the form without saving */
    onCancel: () => void
}

/**
 * Form to give a case its location: a map with a marker and a place search, plus the colonia and calle fields that are always editable
 *
 * It starts with the location the case has; choosing a search result moves the marker and fills the colonia and the calle of its address
 */
export function CaseLocationForm({ caso, busy, error, onSave, onCancel }: Props) {
    const { ubicacion } = caso
    const coloniaId = useId()
    const calleId = useId()
    const [colonia, setColonia] = useState(ubicacion.colonia ?? '')
    const [calle, setCalle] = useState(ubicacion.calle ?? '')
    const [point, setPoint] = useState<GeoPoint | null>(() =>
        hasValidLocation(ubicacion) ? { lat: ubicacion.lat, lng: ubicacion.lng } : null,
    )
    const location = locationOf(colonia, calle, point)
    const changed = differs(location, ubicacion)

    /**
     * Moves the marker to the place and fills the colonia and the calle its address has; the ones it lacks keep what was typed
     *
     * @param place - Place the user chose from the search results
     */
    const choosePlace = (place: GeocodedPlace) => {
        setPoint({ lat: place.lat, lng: place.lng })
        if (place.colonia) setColonia(place.colonia.slice(0, MAX_TEXT))
        if (place.calle) setCalle(place.calle.slice(0, MAX_TEXT))
    }

    return (
        <div className="flex flex-col gap-4 p-5">
            <LocationPicker point={point} onPointChange={setPoint} onPlaceChosen={choosePlace} />

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSave(location)
                }}
                className="flex flex-col gap-4"
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor={coloniaId} className="text-sm font-clear">
                            Colonia
                        </label>
                        <input
                            id={coloniaId}
                            value={colonia}
                            maxLength={MAX_TEXT}
                            onChange={(e) => setColonia(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor={calleId} className="text-sm font-clear">
                            Calle
                        </label>
                        <input
                            id={calleId}
                            value={calle}
                            maxLength={MAX_TEXT}
                            onChange={(e) => setCalle(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <p className="p-0 text-xs font-diffuse">
                    Al elegir un resultado de la búsqueda se rellenan con su dirección; puedes corregirlos. Un dato ya guardado no se puede borrar, solo cambiar
                </p>

                {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onCancel}
                        className="btn-secondary rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!changed || busy}
                        className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busy ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    )
}
