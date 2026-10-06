// TODO
/* 
- card que muestre info resumen de reporte / caso
FILTROS:
// - tipo de trabajo
// - rango de edades
// - nivel de riesgo
// - rango de dias sin atender (reportes que no tienen un caso asignado)
// - rango de horarios laborables y marcador de dias de la semana
- rango de creacion de reportes
- Filtrar por caso o reporte y mostrar color de marcador segun atendido/no atendido
- ? Asignar multiplemente un conjunto de reportes a un usuario 

*/

import { SliderControlled } from "@/components/ui/SliderControlled";
import { DropdownSelect } from "@/components/ui/DropdownSelect";
import { DropdownMultiSelect } from "@/components/ui/DropdownMultiSelect";
import { CheckboxField } from "@/components/ui/CheckboxField";
import {
  AGE_RANGE, DAYS_RANGE, HOUR_RANGE,
  RISK_OPTIONS, WORK_TYPE_OPTIONS, WEEKDAY_OPTIONS,
  REPORT_VISUAL_OPTIONS, CASE_VISUAL_OPTIONS,
  type HeatMapState,
} from "../useHeatMap";

export const Filters = ({ state: s }: { state: HeatMapState }) => (
  <div className="flex h-full w-full flex-col gap-6">
    <h1 className="w-full">Filtros</h1>

    {/* choose what to show */}
    <section className="flex flex-col gap-2">
      <h2>Visibilidad</h2>
      <CheckboxField label="Reportes" checked={s.showReports} setChecked={s.setShowReports} />
      <CheckboxField label="Casos" checked={s.showCases} setChecked={s.setShowCases} />
    </section>

    {/* choose how to color */}
    <section className="flex flex-col gap-2">
      <h2>Colorimetría</h2>
      <DropdownSelect options={REPORT_VISUAL_OPTIONS} option={s.reportVisualOption} setOption={s.setReportVisualOption} label="Colorear reportes por:" />
      <DropdownSelect options={CASE_VISUAL_OPTIONS} option={s.caseVisualOption} setOption={s.setCaseVisualOption} label="Colorear casos por:" />
    </section>

    {/* choose what to filter */}
    <section className="flex flex-col gap-2">
      <h2>Filtrar por</h2>
      <SliderControlled range={AGE_RANGE} value={s.ageRange} setValue={s.setAgeRange} text="Rango de edades" />
      {/* turn off the slider when there are no reports */}
      <SliderControlled range={DAYS_RANGE} value={s.daysRange} setValue={s.setDaysRange} text="Días no atendidos" note="(solo reportes)" disabled={!s.showReports} />
      <DropdownMultiSelect options={RISK_OPTIONS} selected={s.riskLevels} setSelected={s.setRiskLevels} label="Nivel de riesgo:" />
      <DropdownMultiSelect options={WORK_TYPE_OPTIONS} selected={s.workTypes} setSelected={s.setWorkTypes} label="Tipos de trabajo:" />
      <DropdownMultiSelect options={WEEKDAY_OPTIONS} selected={s.weekdays} setSelected={s.setWeekdays} label="Horario de trabajo (días):" />
      <SliderControlled range={HOUR_RANGE} value={s.hourRange} setValue={s.setHourRange} text="Horario de trabajo (24 hrs)" />
    </section>
  </div>
)
