import { Select } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { option } from "@/components/ui/DropdownSelect"

interface DropdownMultiSelectProps {
  options: option[]
  selected: option[]
  setSelected: Dispatch<SetStateAction<option[]>>
  label: string
  placeholder?: string
}

export function DropdownMultiSelect({
  options,
  selected,
  setSelected,
  label,
  placeholder = "Seleccionar",
}: DropdownMultiSelectProps) {
  // { label, value } lets Select know the text of each id
  const items = options.map((o) => ({ label: String(o.label), value: o.id }))

  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 py-2">
      <p className="font-clear">{label}</p>

      <Select.Root<number, true>
        multiple
        items={items}
        value={selected.map((o) => o.id)}
        onValueChange={(ids) => setSelected(options.filter((o) => ids.includes(o.id)))}
      >
        <Select.Trigger className="btn-secondary flex h-8 w-48 items-center justify-between gap-1.5 rounded-lg py-1 pr-2 pl-2.5 text-sm outline-none transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand">
          <Select.Value className="truncate text-left">
            {(ids: number[]) =>
              ids.length === 0
                ? <span className="font-diffuse">{placeholder}</span>
                : ids.length <= 2
                  ? items.filter((i) => ids.includes(i.value)).map((i) => i.label).join(", ")
                  : `${ids.length} seleccionados`
            }
          </Select.Value>
          <Select.Icon render={<ChevronDownIcon className="size-4 shrink-0 font-diffuse" />} />
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner sideOffset={4} alignItemWithTrigger={false} className="isolate z-50">
            <Select.Popup className="max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg bg-card p-1 font-clear shadow-md ring-1 ring-card">
              <Select.List>
                {items.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    className="group flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-component"
                  >
                    {/* checkbox look: the square is filled when the item is selected */}
                    <span className="flex size-4 shrink-0 items-center justify-center rounded border border-slate-300 group-data-selected:border-brand group-data-selected:bg-brand dark:border-slate-600">
                      <Select.ItemIndicator render={<CheckIcon className="size-3 text-white" />} />
                    </span>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
