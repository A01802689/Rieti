import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import useIsDark from '@/lib/utilities/useIsDark'

/** One point of the line chart */
interface GraphData {
    name: string
    value: number
}

interface LineGraphProps {
    /** Points to draw, in order */
    data: GraphData[]
}

/** Line chart of the cases registered over time */
const LineGraph = ({ data }: LineGraphProps) => {
    const dark = useIsDark()
    const textColor = dark ? '#e5e7eb' : '#030712'
    const axisColor = dark ? '#94a3b8' : '#64748b'

    return (
        <div className="w-full rounded-xl bg-card p-6 shadow-sm">
            <h2 className="mb-6">
                Casos registrados
            </h2>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />

                        <XAxis dataKey="name" tick={{ fill: axisColor }} stroke={axisColor} />

                        <YAxis tick={{ fill: axisColor }} stroke={axisColor} />

                        <Tooltip
                            contentStyle={{
                                background: dark ? '#0f172a' : '#ffffff',
                                border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                                borderRadius: 8,
                                color: textColor,
                            }}
                            itemStyle={{ color: textColor }}
                            labelStyle={{ color: textColor }}
                        />

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineGraph
