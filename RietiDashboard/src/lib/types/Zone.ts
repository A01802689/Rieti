import type { BBox, FeatureCollection, Polygon } from "geojson"
import { featureCollection, hexGrid, point, pointsWithinPolygon } from "@turf/turf"
import type { Ubicacion } from "./Report"

// area covered by the heatMap, aprocimated to Atizapán
/** Area covered by the zone grid (approximately Atizapán), as [west, south, east, north] */
export const ZONE_BBOX: BBox = [-99.32, 19.52, -99.19, 19.63]

/** Properties of each zone hexagon */
export type FeatureZoneProps = {
  id: string
  count: number // reports inside the hexagon
}

/** Zone hexagons as a GeoJSON collection */
export type ZoneCollection = FeatureCollection<Polygon, FeatureZoneProps>

// Anything with a location (Reporte, Case...) can be counted
type WithLocation = { ubicacion: Ubicacion }

/**
 * Counts how many items fall in each hexagon of a grid
 *
 * @param items - Reports or cases, anything with a `ubicacion`
 * @param cellSideKm - Side of each hexagon, in km
 * @param bbox - Grid area
 */
export function locations2Zones(
  items: WithLocation[],
  cellSideKm: number = 0.5,
  bbox: BBox = ZONE_BBOX,
): ZoneCollection {
  const points = featureCollection(
    items.map((r) => point([r.ubicacion.lng, r.ubicacion.lat]))
  )

  const features = hexGrid(bbox, cellSideKm, { units: "kilometers" }).features.flatMap((hex, i) => {
    const count = pointsWithinPolygon(points, hex).features.length
    // if (count === 0) return []

    return [{
      type: "Feature" as const,
      geometry: hex.geometry,
      properties: { id: `zone-${i}`, count },
    }]
  })

  return { type: "FeatureCollection", features }
}
