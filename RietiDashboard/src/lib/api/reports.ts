import { parseCantidadNNA, type ReportImageLinks, type Reporte, type ReporteApi, type ReportState } from "../types/Report"
import type { BatchDeleteResult } from "../types/BatchDelete"
import { api } from "./client"
import { logInvalidLocation } from "../utilities/location"

/**
 * Converts a report as the API sends it into the one the dashboard uses
 *
 * @param report - Report whose number of minors is text
 * @returns The same report with its number of minors as CantidadNNA
 */
const normalizeReport = ({ cantidad_nna, ...report }: ReporteApi): Reporte => ({
  ...report,
  cantidad_nna: parseCantidadNNA(cantidad_nna),
})

/**
 * Fetches the reports
 *
 * @param id_case - When passed, only the reports of that case are fetched
 * @returns The reports; the ones with coordinates out of range are kept and only logged
 */
export const getReports = async (id_case?: number) => {
  const sent = await api<ReporteApi[]>(`/reportes` + (id_case !== undefined ? `?id_caso=${id_case}` : ``), {method: "GET"})
  const reports = sent.map(normalizeReport)
  reports.forEach((r) => logInvalidLocation('Report', r.id_reporte, r.ubicacion))
  return reports
}

/**
 * Fetches one report
 *
 * @param id - Id of the report
 * @returns The report detail
 */
export const getReport = async (id: number) => {
  const report = normalizeReport(await api<ReporteApi>(`/reportes/${id}`, {method: "GET"}))
  logInvalidLocation('Report', report.id_reporte, report.ubicacion)
  return report
}

/**
 * Asks for the signed links of the photo of a report; the photo itself is then loaded from S3, which needs no session
 *
 * @param id - Id of the report
 * @returns The link to see the photo, the link to download it and the seconds they last
 * @throws ApiError 404 when the report has no photo or it is not uploaded yet, 502 when S3 cannot be reached
 */
export const getReportImage = (id: number) => api<ReportImageLinks>(`/reportes/${id}/imagen`)

/**
 * Accepts a report, which opens its case with only the municipio of the report as location
 *
 * @param id - Id of the report
 * @returns Report and case ids with the new status
 */
export const acceptReport = (id: number) => api<{
  id_caso: number,
  id_reporte: number,
  estatus_seguimiento: ReportState
}> (`/reportes/${id}/abrir-caso`, {method: "POST"})

/**
 * Accepts a report and fuses it into an existing case
 *
 * @param id_report - Id of the report to accept
 * @param id_case - Id of the case to fuse it with
 * @returns Report and case ids with the new status
 */
export const fuseReport = (id_report: number, id_case: number) => api<{
  id_reporte: number,
  id_caso: number,
  estatus_seguimiento: ReportState
}> (`/reportes/${id_report}/caso`, {
  method: "PUT",
  body: JSON.stringify({
    id_caso: id_case
  })
})

/**
 * Declines a report
 *
 * @param id - Id of the report
 * @returns Report id with the new status; it has no case
 */
export const declineReport = (id: number) => api<{
  id_reporte: number,
  id_caso: null,
  estatus_seguimiento: ReportState
}> (`/reportes/${id}/rechazar`, {method: "POST"})

/**
 * Reopens a rejected report, which goes back to "Recibido"; only an Administrador can
 *
 * @param id - Id of the report
 * @returns Report id with the new status; it has no case
 */
export const reopenReport = (id: number) => api<{
  id_reporte: number,
  id_caso: null,
  estatus_seguimiento: ReportState
}> (`/reportes/${id}/reabrir`, {method: "POST"})

/**
 * Changes the status of a report
 *
 * @param id - Id of the report
 * @param state - New status
 * @returns Report id with the new status
 */
export const changeReportState = (id: number, state: ReportState) => api<{
  id_reporte: number
  estatus_seguimiento: ReportState
}> (`/reportes/${id}/estatus`,
  { method: "PATCH",
    body: JSON.stringify({
      estatus_seguimiento: state
    })
  })

/**
 * Removes a report from its case, which leaves it "En revisión"
 *
 * @param id - Id of the report
 * @returns Report id with the new status; it has no case
 */
export const unlinkReport = (id: number) => api<{
  id_reporte: number,
  id_caso: null,
  estatus_seguimiento: ReportState
}> (`/reportes/${id}/desvincular`, {method: "POST"})

/**
 * Deletes rejected reports and their S3 images; the API skips the rest
 *
 * @param ids - Ids of the reports to delete
 * @returns The ids deleted and the ids skipped
 */
export const deleteReports = (ids: number[]) => api<BatchDeleteResult>(`/reportes`, {
  method: "DELETE",
  body: JSON.stringify({ ids })
})
