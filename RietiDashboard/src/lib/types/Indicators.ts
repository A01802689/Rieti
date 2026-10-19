/*
* JSON de los indicadores de la pantalla de login, endpoint GET (/indicadores/login)
* Es público (no pide sesión), con límite de 30 por minuto y la respuesta se puede guardar un minuto en caché
* ninos_atendidos suma cantidad_nna de los casos En desarrollo o Cerrado ('5 o más' cuenta 5 y 'No sé' cuenta 0)
{
  "reportes_registrados": "number (todos los reportes)",
  "casos_activos": "number (casos Abierto o En desarrollo)",
  "ninos_atendidos": "number"
}
*/

/** Totals the login page shows next to the sign-in card */
export interface LoginIndicators {
  reportes_registrados: number
  casos_activos: number
  ninos_atendidos: number
}
