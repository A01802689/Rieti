import type { Log, LogsQuery } from "../types/Log"
import { api } from "./client"

/**
 * Fetches a page of the logs of the system, newest first, only for an Administrador
 *
 * @param query - Kind of record to keep, text to search, page size and logs to skip; all optional
 * @returns The log entries of the page
 */
export const getLogs = ({ entity_type, buscar, limite, desplazamiento }: LogsQuery = {}) => {
  const params = new URLSearchParams()
  if (entity_type) params.set("entity_type", entity_type)
  if (buscar) params.set("buscar", buscar)
  if (limite !== undefined) params.set("limite", String(limite))
  if (desplazamiento !== undefined) params.set("desplazamiento", String(desplazamiento))
  const query = params.toString()

  return api<Log[]>(`/logs${query ? `?${query}` : ""}`)
}
