import { useState, useMemo, useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { bbox, featureCollection } from "@turf/turf"
import Map, { Source, Layer, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre"
import type { Feature, FeatureCollection, Point } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { reports2GeoJSON, type Reporte, type ReportVisual, type FeatureReportProps } from "@/lib/types/Report"
import { cases2GeoJSON, type Caso, type CaseVisual, type FeatureCaseProps } from "@/lib/types/Case"
import { locations2Zones, type ZoneCollection } from "@/lib/types/Zone"
import { getReports } from "@/lib/api/reports"
import type { Selected } from "@/lib/types/Selected"
import { reportColor, caseColor, ZONE_FILL_COLOR, SELECTED_STROKE } from "@/lib/map/colors"
import { ColorLegend } from "@/components/ui/ColorLegend"



/**
 * Hexagon zones colored by the number of points inside
 *
 * @param data - Zones with their `count`
 */
const ZonesLayer = ({ data }: { data: ZoneCollection }) => (
  <Source id="zonas" type="geojson" data={data}>
    <Layer
      id="zonas-fill"
      type="fill"
      paint={{
        'fill-color': ZONE_FILL_COLOR,
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
  /** Points of the layer */
  data: FeatureCollection<Point, P>
  /** Id of the highlighted point, null when none */
  selectedId: string | null
}

// selected report/case styling
/**
 * Circle layer of the reports
 *
 * @param visual - Property used to color the circles
 */
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

/**
 * Circle layer of the cases
 *
 * @param visual - Property used to color the circles
 */
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


/**
 * Fetches the reports of the default preview
 *
 * @param enabled - Only fetches when true (HeatMap received neither reports nor cases)
 * @returns The reports, or undefined while they load
 */
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



interface HeatMapProps {
  /** Reports to draw. Undefined hides the layer */
  reportsArr?: Reporte[]
  /** Cases to draw. Undefined hides the layer */
  casesArr?: Caso[]
  /** Turn the reports layer on or off */
  showReports?: boolean
  /** Turn the cases layer on or off */
  showCases?: boolean
  /** Property that colors the reports */
  reportVisual?: ReportVisual
  /** Property that colors the cases */
  caseVisual?: CaseVisual
  /** Draw the density zones */
  showZones?: boolean
  /** Side of each zone hexagon, in km */
  zoneCellKm?: number
  /** Draw the color legend */
  showLegend?: boolean
  /** Classes that position the legend */
  legendClassName?: string
  /** Highlighted report or case */
  selected?: Selected | null
  /** Receives the clicked report or case, or null when the map is clicked */
  setSelected?: Dispatch<SetStateAction<Selected | null>>
}

/**
 * Heat map of reports and cases with density zones
 *
 * Without reportsArr and casesArr it loads and shows all the reports (default preview)
 * Zones count the reports, or the cases when there are no reports
 */
const HeatMap = ({
  reportsArr,
  casesArr,
  showReports = true,
  showCases = true,
  reportVisual = 'risk',
  caseVisual = 'urgency',
  showZones = true,
  zoneCellKm = 0.5,
  showLegend = true,
  legendClassName = 'bottom-4 left-4',
  selected = null,
  setSelected,
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
  // zones count every point, even the hidden layers
  const mapZones = useMemo(() => {
    const items = reports ?? casesArr
    return showZones && items ? locations2Zones(items, zoneCellKm) : undefined
  }, [reports, casesArr, showZones, zoneCellKm])

  // hide the layers that are turned off
  const shownReports = showReports ? mapReports : undefined
  const shownCases = showCases ? mapCases : undefined

  // only the shown layers can be clicked
  const interactiveLayerIds = useMemo(
    () => [...(shownReports ? ['reportes'] : []), ...(shownCases ? ['casos'] : [])],
    [shownReports, shownCases],
  )

  // box that contains every point shown (reports and cases)
  const bounds = useMemo(() => {
    const features: Feature<Point>[] = [...(shownReports?.features ?? []), ...(shownCases?.features ?? [])]
    if (features.length === 0) return undefined
    const [west, south, east, north] = bbox(featureCollection(features))
    return [west, south, east, north] as [number, number, number, number]
  }, [shownReports, shownCases])

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
      setSelected?.(null);
      return;
    }

    const id = feature.properties?.id;
    if (id == null) return;
    setSelected?.({ type: feature.layer.id === 'casos' ? 'case' : 'report', id: String(id) })

    const geom = feature.geometry;
    if (geom.type !== 'Point') return;

    const [lng, lat] = geom.coordinates;

    e.target.flyTo({
      center: [lng, lat],
      zoom: Math.max(e.target.getZoom(), 14),
      duration: 600,
    });
  }, [setSelected]);


  return (
    // no cambies el estilo, si necesitas que se vea diferente, cambialo en el contenedor que contenga a HeatMap
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        onLoad={() => setMapLoaded(true)}
        initialViewState={{ longitude: -99.6559, latitude: 19.4969, zoom: 8 }}
        mapStyle={"https://tiles.openfreemap.org/styles/positron"}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        cursor={cursor}
      >
        {mapZones && <ZonesLayer data={mapZones} />}
        {shownReports && <ReportsLayer data={shownReports} selectedId={selected?.type === 'report' ? selected.id : null} visual={reportVisual} />}
        {shownCases && <CasesLayer data={shownCases} selectedId={selected?.type === 'case' ? selected.id : null} visual={caseVisual} />}
      </Map>

      {/* show the colors of the layers that are on */}
      {showLegend && (
        <div className={`absolute z-10 ${legendClassName}`}>
          <ColorLegend
            showReports={!!shownReports}
            showCases={!!shownCases}
            showZones={!!mapZones}
            reportVisual={reportVisual}
            caseVisual={caseVisual}
          />
        </div>
      )}
    </div>
  );
}

export default HeatMap
