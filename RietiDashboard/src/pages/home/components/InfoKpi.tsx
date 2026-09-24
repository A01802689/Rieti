interface InfoKpiProp{
    label: string;
    value: string;
    note: string;
    tone: string;
}

const InfoKpis =({
    label, value, note,  tone,
}: InfoKpiProp) =>{
    return (
        <div className="flex overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-900 shadow-sm transition-colors duration-300">
            <div className={`w-1.5 ${tone}`}/>
            <div className="p-5">
                <p className="text-3xl font-semibold text-slate-800 dark:text-white">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>s
            </div>
        </div>
    )
}
export default InfoKpis;