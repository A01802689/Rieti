interface InfoKpiProp{
    label: string;
    value: string;
    note: string;
    tone: string;
}

const InfoKpis =({label, value, note,  tone,}: InfoKpiProp) =>{
    return (
        <div className="flex overflow-hidden rounded-xl bg-card shadow-sm transition-colors duration-300">
            <div className={`w-1.5 ${tone}`}/>
            <div className="p-5">
                <h1 className="text-2xl py-0">{value}</h1>
                <p className="font-medium">{label}</p>
                <p className="text-xs font-diffuse">{note}</p>
            </div>
        </div>
    )
}
export default InfoKpis;