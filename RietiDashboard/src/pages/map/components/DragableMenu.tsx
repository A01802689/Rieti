import { useRef, useState, type ReactNode, type PointerEvent } from "react"
import { ChevronUp } from "lucide-react"   // ya lo tienes en package.json

const PEEK = 80        // px 
const THRESHOLD = 60   // px de arrastre para cambiar de estado

export function DragableMenu({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const [dragY, setDragY] = useState<number | null>(null) // null = no se está arrastrando
  const startY = useRef(0)

  const onDown = (e: PointerEvent) => {
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragY(0)
  }
  const onMove = (e: PointerEvent) => {
    if (dragY === null) return
    const dy = e.clientY - startY.current
    setDragY(expanded ? Math.max(0, dy) : Math.min(0, dy)) // no dejar que se pase de los extremos
  }
  const onUp = () => {
    if (dragY === null) return
    if (Math.abs(dragY) < 5) setExpanded((v) => !v)   // fue un toque, no un arrastre
    else if (dragY <= -THRESHOLD) setExpanded(true)
    else if (dragY >= THRESHOLD) setExpanded(false)
    setDragY(null)
  }

  const base = expanded ? "0px" : `calc(100% - ${PEEK}px)`

  return (
    <section
      className={`fixed inset-x-0 bottom-0 z-20 flex h-dvh flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 md:hidden
        ${dragY === null ? "transition-transform duration-300 ease-out" : ""}`}
      style={{ transform: `translateY(calc(${base} + ${dragY ?? 0}px))` }}
    >
      <button
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        aria-expanded={expanded}
        aria-label={expanded ? "Contraer" : "Expandir"}
        className="flex h-22 shrink-0 touch-none items-center justify-center"
      >
        <ChevronUp className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <div className={`min-h-0 flex-1 px-4 pb-[env(safe-area-inset-bottom)] ${expanded ? "overflow-y-auto" : "overflow-hidden"}`}>
        {children}
      </div>
    </section>
  )
}