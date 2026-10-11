import type { Reporte } from '../types/Report';

/** Tailwind classes of each report status and case state: `pill` is the badge and `dot` its marker */
export const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  'Recibido': {
    pill: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30',
    dot: 'bg-orange-500',
  },
  'En revisión': {
    pill: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  'Canalizado': {
    pill: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
    dot: 'bg-violet-500',
  },
  'En atención': {
    pill: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  'Concluido': {
    pill: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/30',
    dot: 'bg-green-500',
  },
  'Rechazado': {
    pill: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
  // case states
  'Abierto': {
    pill: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30',
    dot: 'bg-orange-500',
  },
  'En desarrollo': {
    pill: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  'Cerrado': {
    pill: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/30',
    dot: 'bg-green-500',
  },
};

/** Style used when a status has no entry in STATUS_STYLES */
export const DEFAULT_STATUS_STYLE = {
  pill: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-600/40 dark:text-gray-300 dark:ring-gray-500',
  dot: 'bg-gray-400',
};

/**
 * Picks the badge style of a status
 *
 * @param status - Report status or case state
 * @returns Its style, or the default one when it is unknown or empty
 */
export const statusStyle = (status: string | null | undefined) =>
  (status && STATUS_STYLES[status]) || DEFAULT_STATUS_STYLE;

/** Text color of each risk level */
export const RISK_LEVEL_STYLES: Record<string, string> = {
  'Alto': 'text-red-700 dark:text-red-300',
  'Medio': 'text-amber-700 dark:text-amber-300',
  'Bajo': 'text-green-700 dark:text-green-300',
};

/** Text color of each case urgency */
export const URGENCY_STYLES: Record<string, string> = {
  'Alta': 'text-red-700 dark:text-red-300',
  'Media': 'text-amber-700 dark:text-amber-300',
  'Baja': 'text-green-700 dark:text-green-300',
};

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City',
});

/**
 * Formats an ISO date as day, month, year and time in Mexico City time
 *
 * @param iso - ISO 8601 date
 */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));

/**
 * Tells if a value means "no data"
 *
 * @param v - Value to check
 */
export const isUnknown = (v: unknown) => v === null || v === undefined || v === 'Desconocido';

/**
 * Describes the minors of a report, e.g. "2 menores, 6-11 años"
 *
 * @param count - Number of minors
 * @param age - Approximate age range
 */
export function formatMinorDetails(count: Reporte['cantidad_nna'], age: Reporte['edad_aproximada']): string {
  const countText = isUnknown(count) ? 'Cantidad sin dato' : count === 1 ? '1 menor' : `${count} menores`;
  const ageText = isUnknown(age) ? 'Edad sin dato' : `${age} años`;
  return `${countText}, ${ageText}`;
}
