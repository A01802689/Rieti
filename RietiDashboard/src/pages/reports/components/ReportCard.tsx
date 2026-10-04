import type { Reporte } from '../../../lib/types/Report';
 
// Colores por estatus. Un estatus que no esté aquí sale en gris

const ESTATUS: Record<string, { pill: string; dot: string }> = {
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
};


const ESTATUS_DEFAULT = {
  pill: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-600/40 dark:text-gray-300 dark:ring-gray-500',
  dot: 'bg-gray-400',
};
 
const RIESGO: Record<string, string> = {
  'Alto': 'text-red-700 dark:text-red-300',
  'Medio': 'text-amber-700 dark:text-amber-300',
  'Bajo': 'text-green-700 dark:text-green-300',
};
 
const fechaFmt = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  timeZone: 'America/Mexico_City',
});
 
const esDesconocido = (v: unknown) => v === null || v === undefined || v === 'No sé';
 
function textoNNA(cantidad: Reporte['cantidad_nna'], edad: Reporte['edad_aproximada']): string {
  const c = esDesconocido(cantidad) ? 'Cantidad sin dato' : cantidad === 1 ? '1 menor' : `${cantidad} menores`;
  const e = esDesconocido(edad) ? 'edad sin dato' : `${edad} años`;
  return `${c}, ${e}`;
}
 
const iconClass = 'mt-0.5 h-4 w-4 shrink-0 font-diffuse';
const labelClass = 'font-semibold';
 
interface Props {
  reporte: Reporte;
  onDetalle: () => void;
  onVerCaso: () => void;
}
 
export function ReporteCard({ reporte: r, onDetalle, onVerCaso }: Props) {
  const estatus =
    typeof r.estatus_seguimiento === 'string' && r.estatus_seguimiento in ESTATUS
      ? ESTATUS[r.estatus_seguimiento]
      : ESTATUS_DEFAULT;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-card bg-card p-6 shadow-sm transition-colors duration-300 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-lg font-bold font-accent">{r.folio_reporte}</h2>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${estatus.pill}`}>
            <span className={`h-2 w-2 rounded-full ${estatus.dot}`} aria-hidden />
            {r.estatus_seguimiento}
          </span>
          {!esDesconocido(r.tipo_trabajo) && (
            <span className="rounded-full bg-component px-3 py-1 text-sm font-diffuse">
              {r.tipo_trabajo}
            </span>
          )}
          <span className={`text-sm font-medium ${r.riesgo ? RIESGO[r.riesgo] ?? 'font-diffuse' : 'font-diffuse'}`}>
            {r.riesgo ? `Riesgo ${r.riesgo.toLowerCase()}` : 'Riesgo sin evaluar'}
          </span>
        </div>
 
        <p className="mt-3 font-semibold">
          {r.ubicacion.colonia} · {fechaFmt.format(new Date(r.fecha_reporte))}
        </p>
 
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex gap-2">
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>
              <strong className={labelClass}>Ubicación:</strong> {r.ubicacion.calle}, {r.ubicacion.colonia}, {r.ubicacion.municipio}
            </span>
          </p>
          <p className="flex gap-2">
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.6-4.8-4-5.6" />
            </svg>
            <span>
              <strong className={labelClass}>Menores:</strong> {textoNNA(r.cantidad_nna, r.edad_aproximada)}
              <span className="font-diffuse"> · </span>
              {r.id_usuario === null ? 'Reporte anónimo' : `Reportado por usuario #${r.id_usuario}`}
            </span>
          </p>
          <p className="flex gap-2">
            <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 10h8M8 14h8" />
            </svg>
            <span>
              <strong className={labelClass}>Descripción:</strong>{' '}
              {r.descripcion ?? <em className="font-diffuse">Sin descripción</em>}
            </span>
          </p>
        </div>
      </div>
 
      <div className="flex shrink-0 gap-3">
        {r.id_caso !== null && (
          <button
            type="button"
            onClick={onVerCaso}
            className="btn-secondary rounded-lg px-4 py-2 text-sm">
            Ver caso #{r.id_caso}
          </button>
        )}
        <button
          type="button"
          onClick={onDetalle}
          className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
          Detalle →
        </button>
      </div>
    </article>
  );
}
