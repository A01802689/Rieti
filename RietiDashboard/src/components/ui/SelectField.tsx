import { useId } from 'react'
import { NativeSelect, NativeSelectOption } from '@/components/ui/NativeSelect'

interface SelectFieldProps<T extends string | number> {
    /** Text above the select */
    label: string
    /** Current value; null when nothing is chosen yet */
    value: T | null
    /** Values the user can choose, shown as they are */
    options: readonly T[]
    /** Receives the chosen value */
    onChange: (value: T) => void
    /** Text shown while `value` is null; that entry cannot be chosen again once another one is picked */
    placeholder?: string
    /** Shows only the select; the label stays available to screen readers */
    hideLabel?: boolean
    /** Blocks the interaction and dims the field */
    disabled?: boolean
}

/** Select with its label above, for a fixed list of strings or numbers */
export function SelectField<T extends string | number>({
    label,
    value,
    options,
    onChange,
    placeholder,
    hideLabel = false,
    disabled = false,
}: SelectFieldProps<T>) {
    const id = useId()

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-clear'}>
                {label}
            </label>
            <NativeSelect
                id={id}
                className="w-full"
                disabled={disabled}
                value={value === null ? '' : String(value)}
                onChange={(e) => {
                    const chosen = options.find((option) => String(option) === e.target.value)
                    if (chosen !== undefined) onChange(chosen)
                }}
            >
                {value === null && (
                    <NativeSelectOption value="" disabled>
                        {placeholder ?? 'Seleccionar'}
                    </NativeSelectOption>
                )}
                {options.map((option) => (
                    <NativeSelectOption key={option} value={String(option)}>
                        {option}
                    </NativeSelectOption>
                ))}
            </NativeSelect>
        </div>
    )
}
