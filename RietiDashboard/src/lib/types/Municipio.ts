/*
* JSON de Municipio, endpoint (/dashboard/municipios)
[{
  "id_municipio": "number",
  "nombre": "string",
  "clave": "string"
}, ...]
*/

/** Municipality, as the API returns it */
export interface Municipio {
  id_municipio: number
  nombre: string
  clave: string
}
