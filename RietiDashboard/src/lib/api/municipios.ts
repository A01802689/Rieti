import type { Municipio } from "../types/Municipio"
import { api } from "./client"

/**
 * Fetches the municipios
 *
 * @returns The municipios in the database
 */
export const getMunicipios = () => api<Municipio[]>("/municipios")
