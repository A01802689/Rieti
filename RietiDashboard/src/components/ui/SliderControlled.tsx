import { Slider } from "@/components/ui/Slider"
import type { Dispatch, SetStateAction } from "react"


/** Range of a slider as [min, max, step] */
export type rangeType = [number, number, number]

interface SliderControlledProps {
  /** Title of the filter */
  text: string
  /** Current values, one per thumb */
  value: number[]
  /** Receives the new values when a thumb moves */
  setValue: Dispatch<SetStateAction<number[]>>
  /** Minimum, maximum and step */
  range: rangeType
  /** Blocks the slider and dims it */
  disabled?: boolean
  /** Small text next to the title */
  note?: string
}

/** Slider with a title and its current values, used as a filter */
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
