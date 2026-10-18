interface InfoKpiProp{
    /** Name of the indicator */
    label: string
    /** Main number */
    value: string
    /** Small clarification under the label */
    note: string
    /** Background class of the colored side bar */
    tone: string
}

/** Card with one indicator of the home summary */
const InfoKpis =({label, value, note,  tone,}: InfoKpiProp) =>{
    return (
        <div className="flex overflow-hidden rounded-xl bg-card shadow-sm transition-colors duration-300">
            <div className={`w-1 shrink-0 ${tone}`}/>
            <div className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                <h1 className="p-0 text-2xl leading-none">{value}</h1>
                <div className="min-w-0">
                    <p className="truncate p-0 text-sm font-medium leading-tight">{label}</p>
                    <p className="truncate p-0 text-xs font-diffuse leading-tight">{note}</p>
                </div>
            </div>
        </div>
    )
}
export default InfoKpis