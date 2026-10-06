import { Slider } from "@/components/ui/Slider"
import type { Dispatch, SetStateAction } from "react"


export type rangeType = [number, number, number]

interface SliderControlledProps {
  text: string
  value: number[]
  setValue: Dispatch<SetStateAction<number[]>>
  range: rangeType
  disabled?: boolean
  note?: string // small text next to the title
}

export function SliderControlled( {text, value, range, setValue, disabled = false, note}: SliderControlledProps) {

  return (
    <div className="grid w-full gap-3 py-2">
      <div className={`flex items-center justify-between gap-2 ${disabled ? "opacity-50" : ""}`}>
        <p className="font-clear">{text}{note && <span className="text-xs font-diffuse"> {note}</span>}</p>
        <span className="text-sm font-diffuse">
          {value.join(" - ")}
        </span>
      </div>
      <Slider
        // id=
        value={value}
        disabled={disabled}
        onValueChange={(value) => setValue(value as number[])}
        min={range[0]}
        max={range[1]}
        step={range[2]}
      />
    </div>
  )
}
