import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPinOff } from 'lucide-react'
import { hasValidLocation } from '@/lib/utilities/location'
import { MAP_STYLE, MARKER_COLOR } from '@/lib/map/style'
import { Unavailable } from './Unavailable'

interface Props {
    /** Latitude of the marker; null or undefined when the place has no coordinates */
    lat?: number | null
    /** Longitude of the marker; null or undefined when the place has no coordinates */
    lng?: number | null
    /** Classes of the container; the default sets the height */
    className?: string
}

/** Small map with a single marker that shows the location of a case or report; a place without valid coordinates shows a card instead */
export function LocationMap({ lat, lng, className = 'h-52' }: Props) {
    const place = { lat, lng }

    if (!hasValidLocation(place)) {
        return <Unavailable message="Ubicación no disponible" icon={MapPinOff} className={className} />
    }

    return (
        <div className={`w-full overflow-hidden rounded-lg ${className}`}>
            <Map
                key={`${place.lat},${place.lng}`}
                initialViewState={{ latitude: place.lat, longitude: place.lng, zoom: 15 }}
                mapStyle={MAP_STYLE}
                scrollZoom={false}
            >
                <Marker latitude={place.lat} longitude={place.lng} color={MARKER_COLOR} />
            </Map>
        </div>
    )
}
