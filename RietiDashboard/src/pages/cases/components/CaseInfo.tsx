import { DocumentIcon, UserIcon } from './CaseIcons';
import type { Caso } from '@/lib/types/Case';
import type { Reporte } from '@/lib/types/Report';
import { Empty, Field } from '@/components/ui/ReportDetails';
import { LocationMap } from '@/components/ui/LocationMap';
import { ReportImage } from '@/components/ui/ReportImage';
import { formatDateTime, isUnknown } from '@/lib/utilities/reportStyles';

const unique = <T,>(items: T[]) => [...new Set(items)];

export function Card({ title, icon, tone, children }: { title: string; icon: React.ReactNode; tone: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4 rounded-xl border border-card bg-card p-4 shadow-sm transition-colors duration-300 sm:p-6">
            <div className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${tone}`} aria-hidden>
                    {icon}
                </span>
                <h2 className="p-0">{title}</h2>
            </div>
            {children}
        </section>
    );
}

// "Información del denunciante": built from the case's first report (reports carry no contact data)
export function ReporterCard({ reports }: { reports: Reporte[] }) {
    const first = reports[0];
    return (
        <Card title="Información del denunciante" icon={<UserIcon />} tone="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
            {first ? (
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Field label="Reportante">
                        {first.id_usuario === null ? 'Anónimo' : `Usuario #${first.id_usuario}`}
                    </Field>
                    <Field label="Primer reporte">{first.folio_reporte}</Field>
                    <Field label="Fecha">{formatDateTime(first.fecha_reporte)}</Field>
                </dl>
            ) : (
                <Empty text="Este caso no tiene reportes asociados." />
            )}
        </Card>
    );
}

export function CaseDataCard({ caso, reports }: { caso: Caso; reports: Reporte[] }) {
    const counts = reports.map((r) => r.cantidad_nna);
    const numeric = counts.filter((c): c is 1 | 2 | 3 | 4 => typeof c === 'number');
    const kids = numeric.length ? String(Math.max(...numeric)) : counts.includes('5 o más') ? '5 o más' : 'Sin dato';
    const ages = unique(reports.map((r) => r.edad_aproximada).filter((a) => !isUnknown(a)));
    const types = unique(reports.map((r) => r.tipo_trabajo).filter((t) => !isUnknown(t)));
    const descriptions = reports.filter((r) => r.descripcion);
    const photos = reports.filter((r) => r.imagen);

    return (
        <Card title="Datos del caso" icon={<DocumentIcon />} tone="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Field label="Niños">{kids}</Field>
                <Field label="Edades">{ages.length ? `${ages.join(', ')} años` : <Empty text="Sin dato" />}</Field>
                <Field label="Tipo">{types.length ? types.join(', ') : <Empty text="Sin dato" />}</Field>
                <Field label="Municipio">{caso.municipio.nombre}</Field>
            </dl>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Ubicación exacta</p>
                <p className="p-0 font-clear">
                    {caso.ubicacion.calle}, {caso.ubicacion.colonia}, {caso.ubicacion.municipio}
                </p>
                <LocationMap lat={caso.ubicacion.lat} lng={caso.ubicacion.lng} />
            </div>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Descripción</p>
                <div className="flex flex-col gap-2 rounded-lg bg-component px-4 py-3">
                    {descriptions.length === 0 ? (
                        <Empty text="Sin descripción" />
                    ) : (
                        descriptions.map((r) => (
                            <p key={r.id_reporte} className="p-0 text-sm">
                                {r.descripcion}
                            </p>
                        ))
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Fotografías</p>
                {photos.length === 0 ? (
                    <ReportImage src={null} alt="" className="h-24" />
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {photos.map((r) => (
                            <ReportImage key={r.id_reporte} src={r.imagen} alt={`Foto del reporte ${r.folio_reporte}`} className="h-48" />
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
