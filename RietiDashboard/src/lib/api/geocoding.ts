import { hasValidLocation } from "../utilities/location"

/** Place found by the search of the location picker */
export interface GeocodedPlace {
  /** Id Nominatim gives to the place, unique in a list of results */
  id: number
  /** Full name of the place, as the results list shows it */
  label: string
  lat: number
  lng: number
  /** Colonia of the address; empty when the place has none */
  colonia: string
  /** Street of the address; empty when the place has none */
  calle: string
}

/** Place as Nominatim sends it with format=jsonv2 and addressdetails=1 */
interface NominatimPlace {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: Partial<Record<"road" | "suburb" | "neighbourhood" | "city_district" | "quarter", string>>
}

/** Direct geocoding endpoint of Nominatim, the public OpenStreetMap service */
const SEARCH_URL = "https://nominatim.openstreetmap.org/search"

/**
 * Searches places in Mexico by the text the user typed; this is the only data that leaves the dashboard
 *
 * Plain fetch without credentials: it does not use the Rieti client, so no session cookie reaches the service, and the
 * referrer is cut to the origin so the page address (it has the case id) is not sent either
 *
 * @param query - Text of a street, colonia or place
 * @param signal - Aborts the request, e.g. when the user searches again
 * @returns Up to 5 places with their coordinates and the colonia and street of their address
 * @throws Error with a message for the user when the service cannot be reached or refuses the request
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", limit: "5", countrycodes: "mx", q: query })

  let res: Response
  try {
    res = await fetch(`${SEARCH_URL}?${params}`, { signal, credentials: "omit", referrerPolicy: "origin" })
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e
    throw new Error("No se pudo conectar con el buscador de lugares")
  }

  if (res.status === 429) throw new Error("Hay demasiadas búsquedas seguidas, espera unos segundos e intenta de nuevo")
  if (!res.ok) throw new Error(`El buscador de lugares no respondió bien (código ${res.status})`)

  const places: NominatimPlace[] = await res.json()

  return places.flatMap((place) => {
    const point = { lat: Number(place.lat), lng: Number(place.lon) }
    if (!hasValidLocation(point)) return []
    const { address = {} } = place

    return [{
      id: place.place_id,
      label: place.display_name,
      ...point,
      colonia: address.suburb ?? address.neighbourhood ?? address.city_district ?? address.quarter ?? "",
      calle: address.road ?? "",
    }]
  })
}
