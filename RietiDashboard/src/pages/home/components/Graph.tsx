import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface GraphData {
    name: string;
    value: number;
}

interface LineGraphProps {
    data: GraphData[];
}

const LineGraph = ({ data }: LineGraphProps) => {
    return (
        <div className="w-full rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-800 dark:text-slate-900">
                Casos registrados
            </h2>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis />

                        <Tooltip />

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
    );
};

export default LineGraph;
