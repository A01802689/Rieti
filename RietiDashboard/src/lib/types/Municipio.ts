/*
* JSON de Municipio, endpoint (/municipios)
[{
  "id_municipio": "number",
  "nombre": "string",
  "clave": "string"
}, ...]
*/

/** Municipality model*/
export interface Municipio {
  id_municipio: number
  nombre: string
  clave: string
}
