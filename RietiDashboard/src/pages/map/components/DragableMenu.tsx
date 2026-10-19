import { useRef, useState, useSyncExternalStore, type ReactNode, type PointerEvent } from "react"
import { ChevronUp } from "lucide-react"

/** Pixels visible when collapsed; keep it in sync with h-22 / w-22 below */
const PEEK = 60
/** Pixels of dragging needed to change the state */
const THRESHOLD = 60
/** Tailwind md breakpoint */
const MD = "(min-width: 768px)"

/**
 * Tells if the screen is md or wider and re-renders when it changes
 *
 * @returns true from the md breakpoint
 */
const useIsMd = () =>
  useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(MD)
      mql.addEventListener("change", cb)
      return () => mql.removeEventListener("change", cb)
    },
    () => window.matchMedia(MD).matches,
    () => false,
  )

/**
 * Floating menu over the page that expands or collapses when dragged or clicked: a bottom sheet on mobile and a right side panel from md
 *
 * @param children - Content shown inside the menu
 */
export function DragableMenu({ children }: { children: ReactNode }) {
  const horizontal = useIsMd()
  const [expanded, setExpanded] = useState(false)
  const [drag, setDrag] = useState<number | null>(null) // null = not dragging
  const start = useRef(0)

  /**
   * Pointer coordinate along the drag axis
   *
   * @param e - Pointer event
   * @returns The x coordinate on md and wider, the y one below
   */
  const position = (e: PointerEvent) => (horizontal ? e.clientX : e.clientY)

  /**
   * Starts the drag and captures the pointer
   *
   * @param e - Pointer event of the press
   */
  const onDown = (e: PointerEvent) => {
    start.current = position(e)
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag(0)
  }
  /**
   * Follows the pointer, only in the direction that moves the menu
   *
   * @param e - Pointer event of the move
   */
  const onMove = (e: PointerEvent) => {
    if (drag === null) return
    const delta = position(e) - start.current
    setDrag(expanded ? Math.max(0, delta) : Math.min(0, delta))
  }

  /** Ends the drag: a click toggles the menu, a long enough drag opens or closes it */
  const onUp = () => {
    if (drag === null) return
    if (Math.abs(drag) < 5) setExpanded((v) => !v)
    else if (drag <= -THRESHOLD) setExpanded(true)
    else if (drag >= THRESHOLD) setExpanded(false)
    setDrag(null)
  }

  const base = expanded ? "0px" : `calc(100% - ${PEEK}px)`

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 flex h-dvh flex-col rounded-t-3xl bg-panel font-clear shadow-2xl
        md:inset-x-auto md:inset-y-0 md:right-0 md:w-1/3 md:flex-row md:rounded-t-none md:rounded-l-3xl lg:w-1/4
        ${drag === null ? "transition-transform duration-300 ease-out" : ""}`}
      style={{ transform: `translate${horizontal ? "X" : "Y"}(calc(${base} + ${drag ?? 0}px))` }}
    >
      <button
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="flex h-15 shrink-0 touch-none items-center justify-center md:h-auto md:w-15"
      >
        <ChevronUp className={`transition-transform duration-300 ${expanded ? "rotate-180 md:rotate-90" : "md:-rotate-90"}`} />
      </button>

      <div className={`min-h-0 min-w-0 flex-1 px-4 pb-[env(safe-area-inset-bottom)] md:py-4 ${expanded ? "overflow-y-auto" : "overflow-hidden"}`}>
        {children}
      </div>
    </div>
  )
}
