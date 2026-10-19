import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useIsDark from '@/lib/utilities/useIsDark'

/** Bar color of each status (same hues as the status pills in reportStyles) */
const STATUS_COLORS: Record<string, string> = {
    'Recibido': '#f97316',
    'En revisión': '#f59e0b',
    'Canalizado': '#8b5cf6',
    'En atención': '#2563eb',
    'Concluido': '#22c55e',
    'Rechazado': '#ef4444',
    'Abierto': '#f97316',
    'En desarrollo': '#2563eb',
    'Cerrado': '#22c55e',
}
/** Bar color of a status that has none of its own */
const FALLBACK_COLOR = '#9ca3af'

interface Props {
    /** Chart title, e.g. "Reportes por estatus" */
    title: string
    /** Filter options with their totals; the "all" option is not drawn */
    options: { value: string; total: number }[]
    /** Value of the option that means "no filter" */
    allValue: string
    /** Currently selected filter, its bar is highlighted (default: none, all bars full) */
    selected?: string
    /** Called when a bar is clicked, to apply that filter */
    onSelect?: (value: string) => void
    /** Classes of the outer section, replaces the default top margin */
    className?: string
}

/** Bar chart with the number of items of each status filter */
export function StatusChart({ title, options, allValue, selected = allValue, onSelect, className = 'mt-4' }: Props) {
    const dark = useIsDark()
    const data = options.filter((o) => o.value !== allValue).map((o) => ({ name: o.value, total: o.total }))
    const axisColor = dark ? '#9ca3af' : '#6b7280'

    return (
        <section aria-label={title} className={`rounded-xl bg-component p-4 ${className}`}>
            <h2 className="p-0 text-base">{title}</h2>
            <div className="mt-2 h-48 w-full sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: dark ? '#1e293b' : '#e2e8f0', opacity: 0.5 }}
                            contentStyle={{
                                background: dark ? '#0f172a' : '#ffffff',
                                border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                                borderRadius: 8,
                                color: dark ? '#e5e7eb' : '#030712',
                            }}
                            itemStyle={{ color: dark ? '#e5e7eb' : '#030712' }}
                            labelStyle={{ color: dark ? '#e5e7eb' : '#030712' }}
                            formatter={(value) => [value, 'Total']}
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]} cursor={onSelect ? 'pointer' : 'default'} onClick={(d) => onSelect?.(String(d.name))}>
                            {data.map((d) => (
                                <Cell
                                    key={d.name}
                                    fill={STATUS_COLORS[d.name] ?? FALLBACK_COLOR}
                                    fillOpacity={selected === allValue || selected === d.name ? 1 : 0.35}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
