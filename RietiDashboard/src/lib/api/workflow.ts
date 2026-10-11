import type { Caso, CaseState, CaseUrgency } from '../types/Case';
import type { EstatusSeguimiento, Riesgo } from '../types/Report';
import { cases } from './cases';
import { reportes } from './reports';
import { notify } from './store';
import { seguimientoFolio, timelineOf } from '../utilities/caseTimeline';

// Mutations over the mock data. Each one will become an API call (PATCH/POST) later.

const URGENCY_FROM_RISK: Record<Riesgo, CaseUrgency> = { Alto: 'Alta', Medio: 'Media', Bajo: 'Baja' };

const patchReport = (id: number, patch: Partial<(typeof reportes)[number]>) => {
  const i = reportes.findIndex((r) => r.id_reporte === id);
  if (i === -1) throw new Error(`Reporte ${id} no existe`);
  reportes[i] = { ...reportes[i], ...patch };
};

const patchCase = (id: number, patch: Partial<Caso>) => {
  const i = cases.findIndex((c) => c.id_caso === id);
  if (i === -1) throw new Error(`Caso ${id} no existe`);
  cases[i] = { ...cases[i], ...patch };
};

// Accept: the report becomes a new case
/**
 * Turns a report into a new case
 *
 * @param reportId - Report to accept
 * @returns Id of the new case
 */
export function acceptReport(reportId: number): number {
  const report = reportes.find((r) => r.id_reporte === reportId);
  if (!report) throw new Error(`Reporte ${reportId} no existe`);

  const id_caso = Math.max(0, ...cases.map((c) => c.id_caso)) + 1;
  const fecha_caso = new Date().toISOString();
  cases.push({
    id_caso,
    municipio: { nombre: report.ubicacion.municipio },
    ubicacion: report.ubicacion,
    estado: 'Abierto',
    cantidad_nna: report.cantidad_nna,
    fecha_caso,
    urgencia: report.riesgo ? URGENCY_FROM_RISK[report.riesgo] : 'Media',
    notas: report.descripcion ?? '',
    seguimientos: [
      {
        folio: seguimientoFolio({ id_caso, fecha_caso }, 1),
        fecha: fecha_caso,
        tipo: 'Recepción de reporte',
        autor: 'Administrador',
        nota: `Reporte ${report.folio_reporte} aceptado y canalizado como caso.`,
      },
    ],
  });
  patchReport(reportId, { id_caso, estatus_seguimiento: 'Canalizado' });
  notify();
  return id_caso;
}

// Merge: the report is attached to an existing case
/**
 * Attaches a report to an existing case
 *
 * @param reportId - Report to attach
 * @param caseId - Case that receives it
 */
export function mergeReport(reportId: number, caseId: number) {
  patchReport(reportId, { id_caso: caseId, estatus_seguimiento: 'Canalizado' });
  notify();
}

/**
 * Rejects a report
 *
 * @param reportId - Report to reject
 */
export function rejectReport(reportId: number) {
  patchReport(reportId, { id_caso: null, estatus_seguimiento: 'Rechazado' });
  notify();
}

// Procurator / admin: follow-up on a report that already belongs to a case
/**
 * Changes the follow-up status of a report
 *
 * @param reportId - Report to update
 * @param status - New status
 */
export function setReportStatus(reportId: number, status: EstatusSeguimiento) {
  patchReport(reportId, { estatus_seguimiento: status });
  notify();
}

// Admin only: take a report out of its case (goes back to review)
/**
 * Takes a report out of its case and sends it back to review
 *
 * @param reportId - Report to detach
 */
export function detachReport(reportId: number) {
  patchReport(reportId, { id_caso: null, estatus_seguimiento: 'En revisión' });
  notify();
}

// appends an entry to the case timeline
const logEntry = (caseId: number, tipo: string, autor: string, nota: string | null): Partial<Caso> => {
  const c = cases.find((x) => x.id_caso === caseId);
  if (!c) throw new Error(`Caso ${caseId} no existe`);
  const timeline = timelineOf(c);
  return {
    seguimientos: [
      ...timeline,
      { folio: seguimientoFolio(c, timeline.length + 1), fecha: new Date().toISOString(), tipo, autor, nota },
    ],
  };
};

/**
 * Changes the state of a case and logs it in the timeline
 *
 * @param caseId - Case to update
 * @param estado - New state
 * @param autor - Who made the change
 */
export function setCaseState(caseId: number, estado: CaseState, autor: string) {
  patchCase(caseId, { estado, ...logEntry(caseId, 'Cambio de estado', autor, `Estado: ${estado}`) });
  notify();
}

/**
 * Moves a case to another municipality and logs it in the timeline
 *
 * @param caseId - Case to transfer
 * @param municipio - Name of the new municipality
 * @param autor - Who made the change
 */
export function transferCase(caseId: number, municipio: string, autor: string) {
  patchCase(caseId, {
    municipio: { nombre: municipio },
    ...logEntry(caseId, 'Transferencia', autor, `Transferido a ${municipio}`),
  });
  notify();
}

/**
 * Adds a note to the timeline of a case
 *
 * @param caseId - Case that receives the note
 * @param nota - Text of the note
 * @param autor - Who wrote it
 */
export function addCaseNote(caseId: number, nota: string, autor: string) {
  patchCase(caseId, logEntry(caseId, 'Nota', autor, nota));
  notify();
}

/**
 * Changes the urgency of a case
 *
 * @param caseId - Case to update
 * @param urgencia - New urgency
 */
export function setCaseUrgency(caseId: number, urgencia: CaseUrgency) {
  patchCase(caseId, { urgencia });
  notify();
}
