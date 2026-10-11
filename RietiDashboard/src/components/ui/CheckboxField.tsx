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
}

/** Controlled checkbox with its label */
export function CheckboxField({ label, checked, setChecked, disabled = false }: CheckboxFieldProps) {
  return (
    <label className={`flex w-full items-center gap-2 py-1 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <Checkbox.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => setChecked(value)}
        className="flex size-4 shrink-0 items-center justify-center rounded border border-slate-300 outline-none focus-visible:ring-3 focus-visible:ring-brand data-checked:border-brand data-checked:bg-brand dark:border-slate-600"
      >
        <Checkbox.Indicator render={<CheckIcon className="size-3 text-white" />} />
      </Checkbox.Root>
      <span className="text-sm font-clear">{label}</span>
    </label>
  )
}
