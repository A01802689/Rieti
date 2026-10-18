import { Switch } from "@base-ui/react/switch"

interface ToggleProps {
  /** Whether the switch is on */
  checked: boolean
  /** Called with the new value when the user toggles it */
  onChange: (checked: boolean) => void
  /** Blocks the interaction */
  disabled?: boolean
  /** Accessible name of the switch */
  label: string
}

/** On/off switch */
export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-track p-0.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand data-checked:bg-brand data-disabled:cursor-not-allowed data-disabled:opacity-50"
    >
      <Switch.Thumb className="block size-4 rounded-full bg-white shadow transition-transform data-checked:translate-x-4" />
    </Switch.Root>
  )
}
