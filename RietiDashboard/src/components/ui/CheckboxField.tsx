import { Checkbox } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

interface CheckboxFieldProps {
  label: string
  checked: boolean
  setChecked: Dispatch<SetStateAction<boolean>>
}

export function CheckboxField({ label, checked, setChecked }: CheckboxFieldProps) {
  return (
    <label className="flex w-full cursor-pointer items-center gap-2 py-1">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={(value) => setChecked(value)}
        className="flex size-4 shrink-0 items-center justify-center rounded border border-slate-300 outline-none focus-visible:ring-3 focus-visible:ring-brand data-checked:border-brand data-checked:bg-brand dark:border-slate-600"
      >
        <Checkbox.Indicator render={<CheckIcon className="size-3 text-white" />} />
      </Checkbox.Root>
      <span className="text-sm font-clear">{label}</span>
    </label>
  )
}
