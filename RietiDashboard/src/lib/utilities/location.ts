import type { Ubicacion } from '@/lib/types/Report'

/** Maximum absolute latitude; MapLibre throws beyond it (85.05 is only where the Web Mercator tiles end) */
export const MAX_LAT = 90
/** Maximum absolute longitude; MapLibre accepts more but wraps it, which would draw the point in another place */
export const MAX_LNG = 180

/**
 * Tells if the coordinates of a place can be drawn on the map
 *
 * @param ubicacion - Place with the coordinates to check
 * @returns True when lat is within ±90 and lng within ±180
 */
export const hasValidLocation = ({ lat, lng }: Pick<Ubicacion, 'lat' | 'lng'>) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= MAX_LAT && Math.abs(lng) <= MAX_LNG

/**
 * Logs an error when the coordinates are out of range; the item is not removed or changed
 *
 * @param kind - Whether the item is a case or a report
 * @param id - Id of the item, shown in the log
 * @param ubicacion - Place with the coordinates to check
 */
export const logInvalidLocation = (kind: 'Case' | 'Report', id: number, ubicacion: Ubicacion) => {
  if (hasValidLocation(ubicacion)) return

  const { lat, lng } = ubicacion
  console.error(
    `Error parsing ${kind}(s): Invalid coordinates values, values range must be latitude: (-${MAX_LAT} to ${MAX_LAT}) and longitude: (-${MAX_LNG} to ${MAX_LNG}) \n` +
      `Current values: lat=${lat}, lng=${lng} in id "${id}" not allowed`,
  )
}
