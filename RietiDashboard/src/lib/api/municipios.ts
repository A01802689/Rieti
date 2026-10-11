import type { Municipio } from "../types/Municipio"

// this one works as api fetcher
// here will be the fetch done

/** Simulates the municipios endpoint; it will become a fetch */
export const getMunicipios = async (): Promise<Municipio[]> => municipios

/** Hardcoded municipios used while the endpoint does not exist */
export const municipios: Municipio[] = [
  { id_municipio: 1, nombre: "Atizapán de Zaragoza", clave: "15013" },
  { id_municipio: 2, nombre: "Naucalpan de Juárez", clave: "15057" },
  { id_municipio: 3, nombre: "Tlalnepantla de Baz", clave: "15104" },
  { id_municipio: 4, nombre: "Cuautitlán Izcalli", clave: "15024" },
  { id_municipio: 5, nombre: "Nicolás Romero", clave: "15070" },
  { id_municipio: 6, nombre: "Isidro Fabela", clave: "15042" },
]
