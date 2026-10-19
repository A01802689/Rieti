import type { Caso, CasoPatch, Seguimiento } from "../types/Case"
import type { BatchDeleteResult } from "../types/BatchDelete"
import { api } from "./client"
import { logInvalidLocation } from "../utilities/location"

/**
 * Updates a case; omitted or null fields keep their value
 *
 * @param id - Id of the case
 * @param datos - Fields to change, including the location (colonia, calle and the point)
 * @returns The full updated case
 */
export const updateCase = (id: number, datos: CasoPatch) =>
  api<Caso>(`/casos/${id}`, { method: "PATCH", body: JSON.stringify(datos) })

/**
 * Fetches multiple cases; the ones with coordinates out of range are kept and only logged
 *
 * @returns The cases array
 * @throws The request error, so a failed request is not mistaken for an empty list
 */
export const getCases = async () => {
  const cases = await api<Caso[]>(`/casos`, {method: "GET"})
  cases.forEach((c) => logInvalidLocation('Case', c.id_caso, c.ubicacion))
  return cases
}

/**
 * Fetches one case; if its coordinates are out of range it is kept and only logged
 *
 * @param id - Id of the case
 * @returns The case detail
 */
export const getCase = async (id: number) => {
  const caseF = await api<Caso>(`/casos/${id}`, {method: "GET"})
  logInvalidLocation('Case', caseF.id_caso, caseF.ubicacion)
  return caseF
}

/**
 * Transfers a case to another municipio; it does not add a timeline entry
 *
 * @param id - Id of the case
 * @param id_municipio - Id of the municipio that receives the case
 * @returns The updated case
 */
export const transferCase = (id: number, id_municipio: number) => api<Caso>(`/casos/${id}/transferir`,
  { method: "PUT",
    body: JSON.stringify({
      id_municipio
    })
  }
)

/**
 * Adds a note to the timeline of a case
 *
 * @param id - Id of the case
 * @param note - Text of the note
 * @returns The created timeline entry
 */
export const addNote2Case = (id: number, note: string) => api<Seguimiento>(`/casos/${id}/seguimientos`,
  { method: "POST",
    body: JSON.stringify({
      nota: note,
      tipo: "Nota"
    })
  }
)

/**
 * Deletes closed cases and skips the rest; their reports keep their images and location, with no case or status
 *
 * @param ids - Ids of the cases to delete
 * @returns The ids deleted and the ids skipped
 */
export const deleteCases = (ids: number[]) => api<BatchDeleteResult>(`/casos`, {
  method: "DELETE",
  body: JSON.stringify({ ids })
})
