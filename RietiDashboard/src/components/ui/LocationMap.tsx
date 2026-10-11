import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useIsDark from '@/lib/utilities/useTheme';

interface Props {
    /** Latitude of the marker */
    lat: number;
    /** Longitude of the marker */
    lng: number;
    /** Classes of the container; the default sets the height */
    className?: string;
}

/** Small map with a single marker that shows the location of a case or report */
export function LocationMap({ lat, lng, className = 'h-52' }: Props) {
    const style = useIsDark() ? 'dark' : 'positron';

    return (
        <div className={`w-full overflow-hidden rounded-lg ${className}`}>
            <Map
                key={`${lat},${lng}`}
                initialViewState={{ latitude: lat, longitude: lng, zoom: 15 }}
                mapStyle={`https://tiles.openfreemap.org/styles/${style}`}
                scrollZoom={false}
            >
                <Marker latitude={lat} longitude={lng} color="#2563eb" />
            </Map>
        </div>
    );
}
