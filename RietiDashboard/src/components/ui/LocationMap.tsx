import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useIsDark from '@/lib/utilities/useTheme';

interface Props {
    lat: number;
    lng: number;
    className?: string;
}

// Small static map with a single marker (case / report location)
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
