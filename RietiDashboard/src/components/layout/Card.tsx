import type { ReactNode } from "react"
import { cn } from "@/lib/utilities/utils"

type CardProps = {
  /** Content inside the card */
  children: ReactNode
  /** Style classes merged over the default card style */
  className?: string
  /** Called when the card is clicked */
  onClick?: () => void
}

/** Generic card with the shared look (background, border and shadow) */
const Card = ({ children, className, onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={cn("rounded-xl border border-card bg-card shadow-sm transition-colors duration-300", className)}
  >
    {children}
  </div>
)

export default Card
