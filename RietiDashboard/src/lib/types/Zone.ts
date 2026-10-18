import type { BBox, FeatureCollection, Polygon } from "geojson"
import { featureCollection, hexGrid, point, pointsWithinPolygon } from "@turf/turf"
import { hasValidLocation, type MaybeLocation } from "../utilities/location"

/** Area covered by the zone grid (approximately Atizapán), as [west, south, east, north] */
export const ZONE_BBOX: BBox = [-99.32, 19.52, -99.19, 19.63]

/** Properties of each zone hexagon */
export type FeatureZoneProps = {
  id: string
  count: number // reports inside the hexagon
}

/** Zone hexagons as a GeoJSON collection */
export type ZoneCollection = FeatureCollection<Polygon, FeatureZoneProps>

/** Anything with a location (Reporte, Caso) can be counted; the coordinates of a case can be missing */
type WithLocation = { ubicacion: MaybeLocation }

/**
 * Counts how many items fall in each hexagon of a grid
 *
 * @param items - Reports or cases, anything with a `ubicacion`; the ones without valid coordinates are not counted
 * @param cellSideKm - Side of each hexagon, in km
 * @param bbox - Grid area
 * @returns The hexagons with their number of items
 */
export function locations2Zones(
  items: WithLocation[],
  cellSideKm: number = 0.5,
  bbox: BBox = ZONE_BBOX,
): ZoneCollection {
  const points = featureCollection(
    items.flatMap(({ ubicacion }) => (hasValidLocation(ubicacion) ? [point([ubicacion.lng, ubicacion.lat])] : []))
  )

  const features = hexGrid(bbox, cellSideKm, { units: "kilometers" }).features.flatMap((hex, i) => {
    const count = pointsWithinPolygon(points, hex).features.length

    return [{
      type: "Feature" as const,
      geometry: hex.geometry,
      properties: { id: `zone-${i}`, count },
    }]
  })

  return { type: "FeatureCollection", features }
}
