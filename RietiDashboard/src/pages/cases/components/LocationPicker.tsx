import { useRef, useState } from 'react'
import Map, { Marker, NavigationControl, type LngLat, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/lib/map/worker'
import SearchInput from '@/components/ui/SearchInput'
import type { GeocodedPlace } from '@/lib/api/geocoding'
import { MAP_STYLE, MARKER_COLOR } from '@/lib/map/style'
import { AREA_BBOX } from '@/lib/map/style'
import type { GeoPoint } from '@/lib/utilities/location'
import { usePlaceSearch } from '@/lib/utilities/usePlaceSearch'
import { cn } from '@/lib/utilities/utils'

const [west, south, east, north] = AREA_BBOX
/** Area shown when there is no point yet: the area of Atizapán */
const AREA_BOUNDS: [number, number, number, number] = [west, south, east, north]

/** Zoom used when the map goes to a point */
const POINT_ZOOM = 16

/**
 * Turns a position of the map into a point, wrapped to the valid longitudes and rounded to 6 decimals (about 10 cm)
 *
 * @param lngLat - Position given by a click or by dropping the marker
 * @returns The point
 */
const toPoint = (lngLat: LngLat): GeoPoint => {
    const { lat, lng } = lngLat.wrap()
    return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
}

interface LocationPickerProps {
    /** Point of the marker; null while none is placed */
    point: GeoPoint | null
    /** Receives the point where the user clicked the map or dropped the marker */
    onPointChange: (point: GeoPoint) => void
    /** Receives the place chosen from the search results; its point is where the marker has to go */
    onPlaceChosen: (place: GeocodedPlace) => void
    /** Classes of the map container; the default sets the height */
    className?: string
}

/**
 * Map to pick a point: a click places a draggable marker and a search box looks places up by the text typed
 *
 * The map starts on the point it receives, or on the area of Atizapán when there is none, and no coordinates leave the dashboard
 */
export function LocationPicker({ point, onPointChange, onPlaceChosen, className = 'h-72 sm:h-80' }: LocationPickerProps) {
    const mapRef = useRef<MapRef>(null)
    const search = usePlaceSearch()
    // only the first point sets the starting view; afterwards the map moves by the user or by a chosen place
    const [initialView] = useState(() =>
        point
            ? { latitude: point.lat, longitude: point.lng, zoom: POINT_ZOOM }
            : { bounds: AREA_BOUNDS, fitBoundsOptions: { padding: 24 } },
    )

    /**
     * Moves the map and the marker to a place of the results
     *
     * @param place - Place the user chose
     */
    const choose = (place: GeocodedPlace) => {
        mapRef.current?.flyTo({ center: [place.lng, place.lat], zoom: POINT_ZOOM, duration: 600 })
        onPlaceChosen(place)
        search.clear()
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
                <SearchInput
                    className="sm:flex-1"
                    value={search.query}
                    onChange={search.setQuery}
                    onSearch={search.run}
                    placeholder="Buscar una calle, colonia o lugar"
                    label="Buscar un lugar"
                />
                <button
                    type="button"
                    disabled={search.searching || !search.query.trim()}
                    onClick={search.run}
                    className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {search.searching ? 'Buscando…' : 'Buscar'}
                </button>
            </div>

            {search.error && (
                <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">
                    {search.error}
                </p>
            )}
            {search.results?.length === 0 && (
                <p className="p-0 text-sm font-diffuse" role="status">
                    No se encontraron lugares, prueba con otro nombre o agrega la colonia
                </p>
            )}
            {search.results && search.results.length > 0 && (
                <ul aria-label="Resultados de la búsqueda" className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                    {search.results.map((place) => (
                        <li key={place.id}>
                            <button
                                type="button"
                                onClick={() => choose(place)}
                                className="w-full cursor-pointer rounded-lg bg-component px-3 py-2 text-left text-sm font-clear hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                {place.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className={cn('w-full overflow-hidden rounded-lg', className)}>
                <Map
                    ref={mapRef}
                    initialViewState={initialView}
                    mapStyle={MAP_STYLE}
                    cursor="crosshair"
                    onClick={(e) => onPointChange(toPoint(e.lngLat))}
                >
                    <NavigationControl showCompass={false} />
                    {point && (
                        <Marker
                            latitude={point.lat}
                            longitude={point.lng}
                            color={MARKER_COLOR}
                            draggable
                            // a click on the marker is not a click on the map, which would move it
                            onClick={(e) => e.originalEvent.stopPropagation()}
                            onDragEnd={(e) => onPointChange(toPoint(e.lngLat))}
                        />
                    )}
                </Map>
            </div>

            <p className="p-0 text-xs font-diffuse">
                {point
                    ? `Marcador en ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}; arrástralo o haz clic en otro punto para moverlo`
                    : 'Haz clic en el mapa para colocar el marcador'}
            </p>
        </div>
    )
}
