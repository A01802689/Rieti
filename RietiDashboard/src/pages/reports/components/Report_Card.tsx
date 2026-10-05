import type { Reporte } from '../../../lib/types/Report';
import type {useMemo, useState} from 'react';
import { getReports } from '@/lib/api/reports';
import { Navigate, useNavigate } from 'react-router-dom';


const STATUS_STYLES: Record<string, {pill: string; dot: string}> = {
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

const DEFAULT_STATUS_STYLE = {
    pill: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-600/40 dark:text-gray-300 dark:ring-gray-500',
    dot: 'bg-gray-400',
};

const RISK_LEVEL_STYLES: Record<string,string> = {
    'Alto': 'text-red-700 dark:text-red-300',
    'Medio': 'text-amber-700 dark:text-amber-300',
    'Bajo': 'text-green-700 dark:text-green-300',
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
});

const isUknown = (v: unknown) => v === null || v === undefined || v === 'Desconocido';

function formatMinorDetails(
    count: Reporte['cantidad_nna'],
     age: Reporte['edad_aproximada']
    ): string {
    const countText = isUknown(count) ? 'Cantidad sin dato' : count === 1 ? '1 menor' : `${count} menores`;
    const ageText = isUknown(age) ? 'Edad sin dato ' : `${age} años`; 
    return `${countText}, ${ageText}`
}

const iconClass = 'mt-0.5 h-4 w-4 shrink-0 font-diffuse';
const labelClass = 'font-semibold';

interface Props{
    report : Reporte;
    onDetailClick: () => void;
    onViewCaseClick: () => void;
}

export function ReportCard({report, onDetailClick, onViewCaseClick,}: Props) {
    const statusStyle = typeof report.estatus_seguimiento ==='string' && report.estatus_seguimiento in STATUS_STYLES ? STATUS_STYLES[report.estatus_seguimiento] : DEFAULT_STATUS_STYLE;
    const navigation = useNavigate();
    return (
        <article className="flex flex-col gap-4 rounded-xl border border-card bg-card p-6 shadow-sm transition-colors duration-300 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-lg font-bold font-accent">
                {report.folio_reporte}
            </h2>
            <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ${statusStyle.pill}`}>
                <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                aria-hidden
                />
                {report.estatus_seguimiento}
            </span>
            {!isUknown(report.tipo_trabajo) && (
                <span className="rounded-full bg-component px-3 py-1 text-sm font-diffuse">
                {report.tipo_trabajo}
                </span>
            )}
            <span
                className={`text-sm font-medium ${report.riesgo ? RISK_LEVEL_STYLES[report.riesgo] ?? 'font-diffuse' : 'font-diffuse'}`}>
                {report.riesgo ? `Riesgo ${report.riesgo.toLowerCase()}`: 'Riesgo sin evaluar'}
            </span>
            </div>

            <p className="mt-3 font-semibold"> 
                {report.ubicacion.colonia} ·{' '}
                {dateTimeFormatter.format(new Date(report.fecha_reporte))}
            </p>

            <div className="mt-3 space-y-2 text-sm">
            <p className="flex gap-2">
            <svg 
                className={iconClass} // <-- Changed from labelClass to iconClass
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2}
                aria-hidden
            >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 10h8M8 14h8" />
            </svg>
            <span>
                <strong className={labelClass}>Descripción:</strong>{' '}
                {report.descripcion ?? (
                <em className="font-diffuse">Sin descripción</em>
                )}
            </span>
            </p>
            <p className="flex gap-2">
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                aria-hidden
                >
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.6-4.8-4-5.6" />
                </svg>
                <span>
                <strong className={labelClass}>Menores:</strong>{' '}
                {formatMinorDetails(
                    report.cantidad_nna,
                    report.edad_aproximada
                )}
                <span className="font-diffuse"> · </span>
                {report.id_usuario === null
                    ? 'Reporte anónimo'
                    : `Reportado por usuario #${report.id_usuario}`}
                </span>
            </p>
            <p className="flex gap-2">
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                aria-hidden
                >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 10h8M8 14h8" />
                </svg>
                <span>
                    <strong className={labelClass}>Descripción:</strong>{' '}
                    {report.descripcion ?? (
                        <em className="font-diffuse">Sin descripción</em>
                    )}
                </span>
            </p>
            </div>
        </div>

        <div className="flex shrink-0 gap-3">
            {report.id_caso !== null && (
            <button type="button" onClick={onViewCaseClick} className="btn-secondary rounded-lg px-4 py-2 text-sm"
            >
                Ver caso #{report.id_caso}
            </button>
            )}
            <button type="button" onClick={onDetailClick} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
                Detalle →
            </button>
        </div>
        </article>
    );    
}