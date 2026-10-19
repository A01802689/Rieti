/** Maximum absolute latitude; MapLibre throws beyond it (85.05 is only where the Web Mercator tiles end) */
export const MAX_LAT = 90
/** Maximum absolute longitude; MapLibre accepts more but wraps it, which would draw the point in another place */
export const MAX_LNG = 180

/** Coordinates of a place; null or undefined means the place has none (a case opened from a report starts without them) */
export interface MaybeLocation {
  lat?: number | null
  lng?: number | null
}

/** Point of the map */
export interface GeoPoint {
  lat: number
  lng: number
}

/** Parts of an address; any of them can be missing */
interface AddressParts {
  calle?: string | null
  colonia?: string | null
  municipio?: string | null
}

/**
 * Tells if the coordinates of a place can be drawn on the map
 *
 * @param ubicacion - Place with the coordinates to check
 * @returns True when lat is within ±90 and lng within ±180; false when either is missing or out of range
 */
export function hasValidLocation<T extends MaybeLocation>(ubicacion: T): ubicacion is T & GeoPoint {
  const { lat, lng } = ubicacion
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= MAX_LAT &&
    Math.abs(lng) <= MAX_LNG
  )
}

/**
 * Tells if a coordinate is a number that cannot be drawn
 *
 * @param value - Coordinate to check; null and undefined are not an error, they mean there is none
 * @param max - Maximum absolute value allowed
 * @returns True when the value is a number that is not finite or exceeds the maximum
 */
const isOutOfRange = (value: number | null | undefined, max: number) =>
  typeof value === 'number' && !(Number.isFinite(value) && Math.abs(value) <= max)

/**
 * Logs an error when the coordinates are numbers out of range; the item is not removed or changed
 *
 * A place without coordinates is not logged, since it has none instead of wrong ones
 *
 * @param kind - Whether the item is a case or a report
 * @param id - Id of the item, shown in the log
 * @param ubicacion - Place with the coordinates to check
 */
export const logInvalidLocation = (kind: 'Case' | 'Report', id: number, ubicacion: MaybeLocation) => {
  const { lat, lng } = ubicacion
  if (!isOutOfRange(lat, MAX_LAT) && !isOutOfRange(lng, MAX_LNG)) return

  console.error(
    `Error parsing ${kind}(s): Invalid coordinates values, values range must be latitude: (-${MAX_LAT} to ${MAX_LAT}) and longitude: (-${MAX_LNG} to ${MAX_LNG}) \n` +
      `Current values: lat=${lat}, lng=${lng} in id "${id}" not allowed`,
  )
}

/**
 * Writes an address as "calle, colonia, municipio", leaving out the parts that are missing
 *
 * @param ubicacion - Place with the parts of the address
 * @returns The address, or null when every part is missing
 */
export const formatAddress = (ubicacion: AddressParts) =>
  [ubicacion.calle, ubicacion.colonia, ubicacion.municipio].filter(Boolean).join(', ') || null
