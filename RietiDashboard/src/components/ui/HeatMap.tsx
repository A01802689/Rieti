import { useState, useMemo, useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { bbox, featureCollection } from "@turf/turf"
import Map, { Source, Layer, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre"
import type { Feature, FeatureCollection, Point } from "geojson"
import type { CircleLayerSpecification, ExpressionSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "@/lib/map/worker"
import { reports2GeoJSON, type Reporte, type ReportVisual, type FeatureReportProps } from "@/lib/types/Report"
import { cases2GeoJSON, type Caso, type CaseVisual, type FeatureCaseProps } from "@/lib/types/Case"
import { isForbidden } from "@/lib/api/client"
import { getReports } from "@/lib/api/reports"
import type { Selected } from "@/lib/types/Selected"
import { reportColor, caseColor, HEAT_COLOR, HEAT_RADIUS, HEAT_INTENSITY, HEAT_OPACITY, POINT_OPACITY, SELECTED_STROKE } from "@/lib/map/colors"
import { MAP_STYLE } from "@/lib/map/style"
import { ColorLegend } from "@/components/ui/ColorLegend"
import { Forbidden } from "@/components/ui/Forbidden"



/**
 * Paint of the circles of the points: solid from the city level on, invisible (but still clickable) far away, where only the selected one keeps its ring
 *
 * @param color - Expression that colors each point
 * @param selectedId - Id of the selected point, null when none
 * @returns The paint of the circle layer
 */
const pointPaint = (color: ExpressionSpecification, selectedId: string | null): NonNullable<CircleLayerSpecification['paint']> => {
  const selected: ExpressionSpecification = ['==', ['get', 'id'], selectedId ?? '']
  return {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, ['case', selected, 12, 10], 14, ['case', selected, 9, 6]],
    'circle-color': color,
    'circle-opacity': POINT_OPACITY,
    'circle-stroke-width': 2,
    'circle-stroke-color': ['case', selected, SELECTED_STROKE, '#ffffff'],
    'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 10.5, ['case', selected, 1, 0], 12.5, 1],
  }
}

/**
 * Density layer: the more points are close, the hotter the color (blue, green, yellow, orange, red)
 *
 * @param data - Every point shown, reports and cases together
 */
const DensityLayer = ({ data }: { data: FeatureCollection<Point> }) => (
  <Source id="calor" type="geojson" data={data}>
    <Layer
      id="calor"
      type="heatmap"
      paint={{
        'heatmap-weight': 1,
        'heatmap-intensity': HEAT_INTENSITY,
        'heatmap-color': HEAT_COLOR,
        'heatmap-radius': HEAT_RADIUS,
        'heatmap-opacity': HEAT_OPACITY,
      }}
    />
  </Source>
)

interface PointsLayerProps<P> {
  /** Points of the layer */
  data: FeatureCollection<Point, P>
  /** Id of the highlighted point, null when none */
  selectedId: string | null
}

/**
 * Circles of the reports
 *
 * @param visual - Property used to color the points
 */
const ReportsLayer = ({ data, selectedId, visual }: PointsLayerProps<FeatureReportProps> & { visual: ReportVisual }) => (
  <Source id="reportes" type="geojson" data={data}>
    <Layer id="reportes" type="circle" paint={pointPaint(reportColor(visual), selectedId)} />
  </Source>
)

/**
 * Circles of the cases
 *
 * @param visual - Property used to color the points
 */
const CasesLayer = ({ data, selectedId, visual }: PointsLayerProps<FeatureCaseProps> & { visual: CaseVisual }) => (
  <Source id="casos" type="geojson" data={data}>
    <Layer id="casos" type="circle" paint={pointPaint(caseColor(visual), selectedId)} />
  </Source>
)




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
 * Heat map of reports and cases: a density layer (blue to red) over the whole city, with the points on top of it from the city level on
 *
 * Without reportsArr and casesArr it loads and shows all the reports (default preview), or tells the user has no permission to see them
 */
const HeatMap = ({
  reportsArr,
  casesArr,
  showReports = true,
  showCases = true,
  reportVisual = 'risk',
  caseVisual = 'urgency',
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
  const [fetchedReports, setFetchedReports] = useState<Reporte[]>([])
  const [forbidden, setForbidden] = useState(false)

  // the default preview loads its own reports; with props nothing is fetched
  useEffect(() => {
    if (!isDefault) return

    const getData = async () => {
      try {
        setFetchedReports(await getReports())
      } catch (e) {
        console.error(`Error fetching reports from api ${e}`)
        setForbidden(isForbidden(e))
      }
    }

    getData()
  }, [isDefault])

  const reports = isDefault ? fetchedReports : reportsArr

  const mapReports = useMemo(() => (reports ? reports2GeoJSON(reports) : undefined), [reports])
  const mapCases = useMemo(() => (casesArr ? cases2GeoJSON(casesArr) : undefined), [casesArr])

  const shownReports = showReports ? mapReports : undefined
  const shownCases = showCases ? mapCases : undefined

  const density = useMemo(() => {
    const features: Feature<Point>[] = [...(shownReports?.features ?? []), ...(shownCases?.features ?? [])]
    return features.length > 0 ? featureCollection(features) : undefined
  }, [shownReports, shownCases])

  // only the shown layers can be clicked
  const interactiveLayerIds = useMemo(
    () => [...(shownReports ? ['reportes'] : []), ...(shownCases ? ['casos'] : [])],
    [shownReports, shownCases],
  )

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
    const feature = e.features?.[0]

    if (!feature) {
      setSelected?.(null)
      return
    }

    const id = feature.properties?.id
    if (id == null) return
    setSelected?.({ type: feature.layer.id === 'casos' ? 'case' : 'report', id: String(id) })

    const geom = feature.geometry
    if (geom.type !== 'Point') return

    const [lng, lat] = geom.coordinates

    e.target.flyTo({
      center: [lng, lat],
      zoom: Math.max(e.target.getZoom(), 14),
      duration: 600,
    })
  }, [setSelected])

  if (forbidden) return <Forbidden className="h-full" />

  return (
    // no cambies el estilo, si necesitas que se vea diferente, cambialo en el contenedor que contenga a HeatMap
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        onLoad={() => setMapLoaded(true)}
        initialViewState={{ longitude: -99.6559, latitude: 19.4969, zoom: 8 }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        cursor={cursor}
      >
        {density && <DensityLayer data={density} />}
        {shownReports && <ReportsLayer data={shownReports} selectedId={selected?.type === 'report' ? selected.id : null} visual={reportVisual} />}
        {shownCases && <CasesLayer data={shownCases} selectedId={selected?.type === 'case' ? selected.id : null} visual={caseVisual} />}
      </Map>

      {showLegend && (
        <div className={`absolute z-10 ${legendClassName}`}>
          <ColorLegend
            showReports={!!shownReports}
            showCases={!!shownCases}
            reportVisual={reportVisual}
            caseVisual={caseVisual}
          />
        </div>
      )}
    </div>
  )
}

export default HeatMap
