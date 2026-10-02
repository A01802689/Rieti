// TODO
/* 
- mostrar cada y reporte caso de la localidad a los que se tiene acceso el usuario en el mapa 
- hacer una funcioon que calcule un radio de x km en el que haya mayor concentracion de casos
- card que muestre info resumen de reporte / caso
FILTROS:
- tipo de trabajo
- rango de edades
- nivel de riesgo
- rango de dias sin atender (reportes que no tienen un caso asignado)
- ? mapa por distribucion de poblacion (cuantos reportes por cada mil menores en la zona)
- rango de horarios laborables y marcador de dias de la semana
- rango de creacion de reportes
- Filtrar por caso o reporte y mostrar color de marcador segun atendido/no atendido
- ? Asignar multiplemente un conjunto de reportes a un usuario 

*/

import { useState, useMemo, useEffect, useCallback } from "react"
import Map, { Source, Layer, type MapLayerMouseEvent } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { reports2GeoJSON, type Reporte } from "@/lib/types/Report"
import {  reports } from "@/lib/api/reports"

interface HeatMapProps {
  reportsArr?: Reporte[] 
  // casesArr?: Caso[]
  // zonesArr?: Zone[]
}


const HeatMap = ({ reportsArr = reports }: HeatMapProps) => {
  const [cursor, setCursor] = useState<string>('grab')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const datosMapa = useMemo(() => reports2GeoJSON(reportsArr), [])


  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];

    if (!feature) {
      setSelectedId(null);
      return;
    }

    setSelectedId(feature.properties.id);

    const geom = feature.geometry;
    if (geom.type !== 'Point') return;

    const [lng, lat] = geom.coordinates;

    e.target.flyTo({
      center: [lng, lat],
      zoom: Math.max(e.target.getZoom(), 14),
      duration: 600,
    });
  }, []);



  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <Map
        initialViewState={{ longitude: -99.6559, latitude: 19.4969, zoom: 8 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        interactiveLayerIds={['reportes']}
        onClick={onClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        cursor={cursor}
      >
        <Source id="reportes" type="geojson" data={datosMapa}>
          <Layer
            id="reportes"
            type="circle"
            // filter={filtroCapa}
            paint={{
              'circle-radius': ['case', ['==', ['get', 'id'], selectedId ?? ''], 10, 7],
              'circle-color': ['match', ['get', 'riesgo'],
                'Alto', '#dc2626', 'Medio', '#f59e0b', '#16a34a'],
              'circle-stroke-width': 2,
              'circle-stroke-color': ['case', ['==', ['get', 'id'], selectedId ?? ''], '#1d4ed8', '#ffffff'],
            }}
          />
        </Source>
      </Map>

      {/* {selectedId && (
        <PanelCaso id={selectedId} onClose={() => setSelectedId(null)} />
      )} */}
    </div>
  );
}

export default HeatMap