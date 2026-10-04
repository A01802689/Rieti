import { useState, useMemo, useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { bbox, featureCollection } from "@turf/turf"
import Map, { Source, Layer, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre"
import type { Feature, FeatureCollection, Point } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { reports2GeoJSON, type Reporte, type ReportVisual, type FeatureReportProps } from "@/lib/types/Report"
import { cases2GeoJSON, type Case, type CaseVisual, type FeatureCaseProps } from "@/lib/types/Case"
import { locations2Zones, type ZoneCollection } from "@/lib/types/Zone"
import { getReports } from "@/lib/api/reports"
import { reportColor, caseColor, SELECTED_STROKE } from "@/lib/map/colors"
import useIsDark from "@/lib/utilities/useTheme"



const ZonesLayer = ({ data }: { data: ZoneCollection }) => (
  <Source id="zonas" type="geojson" data={data}>
    <Layer
      id="zonas-fill"
      type="fill"
      paint={{
        // count = nocolor: white, 1-9: yellow, 10-19: red, 20+: darker red
        'fill-color': ['step', ['get', 'count'], '#ffffff', 1, '#fbbf24', 10, '#ff4626', 20, '#b00323'],
        'fill-opacity': ['step', ['get', 'count'],0, 1, 0.35],
      }}
    />
    <Layer
      id="zonas-line"
      type="line"
      paint={{ 'line-color': '#7f1d1d', 'line-width': 0.1}}
    />
  </Source>
)

interface PointsLayerProps<P> {
  data: FeatureCollection<Point, P>
  selectedId: string | null
}

// selected report/case styling
const ReportsLayer = ({ data, selectedId, visual }: PointsLayerProps<FeatureReportProps> & { visual: ReportVisual }) => (
  <Source id="reportes" type="geojson" data={data}>
    <Layer
      id="reportes"
      type="circle"
      // filter={filtroCapa}
      paint={{
        'circle-radius': ['case', ['==', ['get', 'id'], selectedId ?? ''], 10, 7],
        'circle-color': reportColor(visual),
        'circle-stroke-width': 2,
        'circle-stroke-color': ['case', ['==', ['get', 'id'], selectedId ?? ''], SELECTED_STROKE, '#ffffff'],
      }}
    />
  </Source>
)

const CasesLayer = ({ data, selectedId, visual }: PointsLayerProps<FeatureCaseProps> & { visual: CaseVisual }) => (
  <Source id="casos" type="geojson" data={data}>
    <Layer
      id="casos"
      type="circle"
      paint={{
        'circle-radius': ['case', ['==', ['get', 'id'], selectedId ?? ''], 10, 7],
        'circle-color': caseColor(visual),
        'circle-stroke-width': 2,
        'circle-stroke-color': ['case', ['==', ['get', 'id'], selectedId ?? ''], SELECTED_STROKE, '#ffffff'],
      }}
    />
  </Source>
)


// Default preview: only runs when HeatMap is rendered without reports or cases.
// Promise.resolve lets getReports be sync (mock) or async (real fetch).
const useDefaultReports = (enabled: boolean): Reporte[] | undefined => {
  const [data, setData] = useState<Reporte[]>()

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    Promise.resolve(getReports())
      .then((r) => { if (!cancelled) setData(r) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [enabled])

  return data
}



// If reports and cases are undefined, the def preview (unfiltered reports) is loaded.
// Zones count the reports (or cases when there r no reports).
interface HeatMapProps {
  reportsArr?: Reporte[]
  casesArr?: Case[]
  reportVisual?: ReportVisual
  caseVisual?: CaseVisual
  showZones?: boolean
  zoneCellKm?: number
  selectedReportId?: string | null
  setSelectedReportId?: Dispatch<SetStateAction<string | null>>
  selectedCaseId?: string | null
  setSelectedCaseId?: Dispatch<SetStateAction<string | null>>
}

const HeatMap = ({
  reportsArr,
  casesArr,
  reportVisual = 'risk',
  caseVisual = 'urgency',
  showZones = true,
  zoneCellKm = 0.5,
  selectedReportId = null,
  setSelectedReportId,
  selectedCaseId = null,
  setSelectedCaseId
}: HeatMapProps) => {
  const [cursor, setCursor] = useState<string>('grab')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<MapRef>(null)
  const hasFitted = useRef(false)

  const isDefault = reportsArr === undefined && casesArr === undefined
  const defaultReports = useDefaultReports(isDefault)
  const reports = isDefault ? defaultReports : reportsArr

  const mapReports = useMemo(() => (reports ? reports2GeoJSON(reports) : undefined), [reports])
  const mapCases = useMemo(() => (casesArr ? cases2GeoJSON(casesArr) : undefined), [casesArr])
  const mapZones = useMemo(() => {
    const items = reports ?? casesArr
    return showZones && items ? locations2Zones(items, zoneCellKm) : undefined
  }, [reports, casesArr, showZones, zoneCellKm])

  // only the defined layers can be clicked
  const interactiveLayerIds = useMemo(
    () => [...(mapReports ? ['reportes'] : []), ...(mapCases ? ['casos'] : [])],
    [mapReports, mapCases],
  )

  // box that contains every point shown (reports and cases)
  const bounds = useMemo(() => {
    const features: Feature<Point>[] = [...(mapReports?.features ?? []), ...(mapCases?.features ?? [])]
    if (features.length === 0) return undefined
    const [west, south, east, north] = bbox(featureCollection(features))
    return [west, south, east, north] as [number, number, number, number]
  }, [mapReports, mapCases])

  // center the map once
  useEffect(() => {
    if (!mapLoaded || !bounds || hasFitted.current) return
    mapRef.current?.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 })
    hasFitted.current = true
  }, [mapLoaded, bounds])

  // one handler for both layers: feature.layer.id tells which one was clicked
  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];

    if (!feature) {
      setSelectedReportId?.(null);
      setSelectedCaseId?.(null);
      return;
    }

    const id = feature.properties?.id;
    if (id == null) return;

    if (feature.layer.id === 'casos') {
      setSelectedCaseId?.(String(id));
      setSelectedReportId?.(null);
    } else {
      setSelectedReportId?.(String(id));
      setSelectedCaseId?.(null);
    }

    const geom = feature.geometry;
    if (geom.type !== 'Point') return;

    const [lng, lat] = geom.coordinates;

    e.target.flyTo({
      center: [lng, lat],
      zoom: Math.max(e.target.getZoom(), 14),
      duration: 600,
    });
  }, [setSelectedReportId, setSelectedCaseId]);

  let mapStyle= (useIsDark()) ? 'dark' : 'positron'
  // useEffect( ()=>{ mapStyle  }, [useIsDark])

  return (
    // no cambies el estilo, si necesitas que se vea diferente, cambialo en el contenedor que contenga a HeatMap
    <>
      <Map
        ref={mapRef}
        onLoad={() => setMapLoaded(true)}
        initialViewState={{ longitude: -99.6559, latitude: 19.4969, zoom: 8 }}
        mapStyle={"https://tiles.openfreemap.org/styles/" + mapStyle}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        cursor={cursor}
      >
        {/* zones first, circles drawn on top */}
        {mapZones && <ZonesLayer data={mapZones} />}
        {mapReports && <ReportsLayer data={mapReports} selectedId={selectedReportId} visual={reportVisual} />}
        {mapCases && <CasesLayer data={mapCases} selectedId={selectedCaseId} visual={caseVisual} />}
      </Map>

      {/* {selectedId && (
        <PanelCaso id={selectedId} onClose={() => setSelectedId(null)} />
      )} */}
    </>
  );
}

export default HeatMap