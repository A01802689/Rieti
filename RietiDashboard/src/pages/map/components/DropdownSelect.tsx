import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/NativeSelect"
import type { Dispatch, SetStateAction } from "react"

type propsType = string | readonly string[] | number | undefined

/** Option of a dropdown: `id` identifies it, `label` is shown and `value` is the data */
export type option = {
  id: number
  label:  propsType, 
  value: propsType
}

interface DropdownSelectProps{
  /** All the options of the list */
  options: option[]
  /** Current selection; it makes the select controlled */
  option?: option
  /** Receives the chosen option, or undefined when it is cleared */
  setOption: Dispatch<SetStateAction<option | undefined>>
  /** Text shown next to the select */
  label: string
}

/** Native select with a label that lets the user choose one option */
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
