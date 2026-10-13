import type { Municipio } from "../types/Municipio"
import { api } from "./client"

// this one works as api fetcher
// here will be the fetch done

/** Simulates the municipios endpoint; it will become a fetch */
// export const getMunicipios = async (): Promise<Municipio[]> => municipios
let municipios: Municipio[] | null = null
export const getMunicipios = async () => municipios ? municipios : await api<Municipio[]>(`/municipios`, {method: "POST"})

/** Hardcoded municipios used while the endpoint does not exist */
export const municipios1: Municipio[] = [
  { id_municipio: 1, nombre: "Atizapán de Zaragoza", clave: "15013" },
  { id_municipio: 2, nombre: "Naucalpan de Juárez", clave: "15057" },
  { id_municipio: 3, nombre: "Tlalnepantla de Baz", clave: "15104" },
  { id_municipio: 4, nombre: "Cuautitlán Izcalli", clave: "15024" },
  { id_municipio: 5, nombre: "Nicolás Romero", clave: "15070" },
  { id_municipio: 6, nombre: "Isidro Fabela", clave: "15042" },
]
