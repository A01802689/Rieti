import { useState } from 'react'

/** Selection state that a list hands to one of its cards; a card that receives it is in selection mode */
export interface CardSelection {
  /** Whether the card is picked */
  selected: boolean
  /** Picks the card, or drops it if it was picked */
  onToggle: () => void
}

/**
 * Selection mode of a list of items identified by a numeric id, shared by the lists that delete in batches
 *
 * The mode ends by itself when `enabled` turns false (for example when the filter changes), and ids that are no longer listed are not counted
 *
 * @param enabled - Whether the list allows selecting; when false the mode is off and nothing is picked
 * @param visibleIds - Ids of the items listed right now
 * @returns `active` (selection mode on), `ids` (the picked ones that are listed), `isSelected`, `start` (turns the mode on), `toggle` (picks or drops an id) and `clear` (turns the mode off and drops every id)
 */
export function useSelection(enabled: boolean, visibleIds: number[]) {
  const [active, setActive] = useState(false)
  const [picked, setPicked] = useState<number[]>([])

  // leaving the list that allows selecting resets the mode (state adjusted while rendering, it does not loop)
  if (!enabled && (active || picked.length > 0)) {
    setActive(false)
    setPicked([])
  }

  const ids = picked.filter((id) => visibleIds.includes(id))

  /** Turns the selection mode on */
  const start = () => setActive(true)

  /** Turns the selection mode off and drops every picked id */
  const clear = () => {
    setActive(false)
    setPicked([])
  }

  /**
   * Picks an id, or drops it if it was picked
   *
   * @param id - Id of the item
   */
  const toggle = (id: number) =>
    setPicked((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))

  /**
   * Tells if an id is picked
   *
   * @param id - Id of the item
   * @returns True when the item is picked
   */
  const isSelected = (id: number) => ids.includes(id)

  return { active: enabled && active, ids, isSelected, start, toggle, clear }
}

/** Selection returned by {@link useSelection} */
export type Selection = ReturnType<typeof useSelection>
