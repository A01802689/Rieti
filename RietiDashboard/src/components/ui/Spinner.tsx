import { cn } from "@/lib/utilities/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-8 md:size-10 lg:size-12 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
