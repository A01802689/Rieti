import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/NativeSelect"
import type { Dispatch, SetStateAction } from "react"

type propsType = string | readonly string[] | number | undefined

export type option = {
  id: number
  label:  propsType, 
  value: propsType
}

interface DropdownSelectProps{
  options: option[]
  option?: option // current selection, it makes the select controlled
  setOption: Dispatch<SetStateAction<option | undefined>>
  label: string
}

export function DropdownSelect({options,option, label, setOption }: DropdownSelectProps) {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 py-2">
      <p className="font-clear">{label}</p>
      <NativeSelect
        value={option?.id ?? ""}
        onChange={(e) => setOption(options.find((o) => String(o.id) === e.target.value))}
      >
        <NativeSelectOption value="">Seleccionar</NativeSelectOption>
        {options.map((opt) => (
          <NativeSelectOption key={opt.id} value={opt.id}>{opt.label}</NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
