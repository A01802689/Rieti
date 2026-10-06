import type { Reporte } from '@/lib/types/Report';
import { formatDateTime, formatMinorDetails, isUnknown } from '@/lib/utilities/reportStyles';
import { LocationMap } from './LocationMap';
import { ReportImage } from './ReportImage';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0 rounded-lg bg-component px-3 py-2">
            <dt className="text-xs font-diffuse">{label}</dt>
            <dd className="mt-0.5 break-words text-sm font-medium font-clear">{children}</dd>
        </div>
    );
}

export const Empty = ({ text }: { text: string }) => <em className="font-diffuse">{text}</em>;

interface Props {
    report: Reporte;
    // the case page already shows a map, so it hides the one of each report
    withMap?: boolean;
}

// Every field of a report, in tiles. Used expanded inside ReportCard and in the case page.
export function ReportDetails({ report, withMap = true }: Props) {
    const { ubicacion } = report;

    return (
        <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Fecha del reporte">{formatDateTime(report.fecha_reporte)}</Field>
                <Field label="Reportante">
                    {report.id_usuario === null ? 'Reporte anónimo' : `Usuario #${report.id_usuario}`}
                </Field>
                <Field label="Tipo de trabajo">
                    {isUnknown(report.tipo_trabajo) ? <Empty text="Sin dato" /> : report.tipo_trabajo}
                </Field>
                <Field label="Riesgo">{report.riesgo ?? <Empty text="Sin evaluar" />}</Field>
                <Field label="Menores">{formatMinorDetails(report.cantidad_nna, report.edad_aproximada)}</Field>
                <Field label="Caso">{report.id_caso !== null ? `#${report.id_caso}` : <Empty text="Sin caso" />}</Field>
            </dl>

            <div className={`grid grid-cols-1 gap-4 ${withMap ? 'lg:grid-cols-2' : ''}`}>
                <div className="flex flex-col gap-2">
                    <p className="section-label p-0">Ubicación exacta</p>
                    <p className="p-0 font-clear">
                        {ubicacion.calle}, {ubicacion.colonia}, {ubicacion.municipio}
                    </p>
                    {withMap && <LocationMap lat={ubicacion.lat} lng={ubicacion.lng} />}
                </div>

                <div className="flex flex-col gap-2">
                    <p className="section-label p-0">Fotografía</p>
                    <ReportImage src={report.imagen} alt={`Foto del reporte ${report.folio_reporte}`} className="h-52" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p className="section-label p-0">Descripción</p>
                <div className="rounded-lg bg-component px-4 py-3">
                    <p className="p-0 text-sm">{report.descripcion ?? <Empty text="Sin descripción" />}</p>
                </div>
            </div>
        </div>
    );
}
