import { CheckboxField } from '@/components/ui/CheckboxField'
import type { CardSelection } from '@/lib/utilities/useSelection'

interface SelectCheckboxProps {
    /** Accessible name of the checkbox, e.g. "Seleccionar REP-2026-0001" */
    label: string
    /** Selection state of the card */
    selection: CardSelection
}

/** Checkbox of a card in selection mode; its clicks do not reach the card, which toggles itself when clicked anywhere else */
export function SelectCheckbox({ label, selection }: SelectCheckboxProps) {
    return (
        <div className="w-fit" onClick={(e) => e.stopPropagation()}>
            <CheckboxField label={label} hideLabel checked={selection.selected} setChecked={selection.onToggle} />
        </div>
    )
}
