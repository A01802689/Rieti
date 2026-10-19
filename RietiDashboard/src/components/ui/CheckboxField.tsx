import { Checkbox } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

interface CheckboxFieldProps {
  /** Text shown next to the checkbox */
  label: string
  /** Current value */
  checked: boolean
  /** Receives the new value when the user toggles it */
  setChecked: Dispatch<SetStateAction<boolean>>
  /** Blocks the interaction and dims the field */
  disabled?: boolean
  /** Shows only the box; the label stays available to screen readers */
  hideLabel?: boolean
  /** Small note under the label, e.g. what the option requires */
  hint?: string
}

/** Controlled checkbox with its label */
export function CheckboxField({ label, checked, setChecked, disabled = false, hideLabel = false, hint }: CheckboxFieldProps) {
  return (
    <label className={`flex w-full gap-2 py-1 ${hint ? "items-start" : "items-center"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <Checkbox.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => setChecked(value)}
        className={`flex size-4 shrink-0 items-center justify-center rounded border border-slate-300 outline-none focus-visible:ring-3 focus-visible:ring-brand data-checked:border-brand data-checked:bg-brand dark:border-slate-600 ${hint ? "mt-0.5" : ""}`}
      >
        <Checkbox.Indicator render={<CheckIcon className="size-3 text-white" />} />
      </Checkbox.Root>
      <span className={hideLabel ? "sr-only" : "min-w-0 text-sm font-clear"}>
        {label}
        {hint && <span className="block text-xs font-diffuse">{hint}</span>}
      </span>
    </label>
  )
}
