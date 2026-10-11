import type { ReactNode } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

interface PopupProps {
  /** Whether the popup is visible */
  open: boolean
  /** Called when the popup asks to close (X, Escape or overlay click) */
  onClose: () => void
  /** Heading; when it is missing the header is not rendered */
  title?: string
  /** Text shown under the title */
  description?: string
  /** Content of the popup body */
  children: ReactNode
}

/** Modal dialog with a blurred background: a bottom sheet on mobile and a centered window from md */
export function Popup({ open, onClose, title, description, children }: PopupProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-t-2xl border border-card bg-card font-clear shadow-xl outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 max-md:top-auto max-md:bottom-0 max-md:translate-y-0 md:max-w-3xl md:rounded-2xl">
          {title && (
            <div className="flex items-start justify-between gap-4 border-b border-card px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="text-sm font-diffuse">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.Close
                aria-label="Cerrar"
                className="shrink-0 cursor-pointer rounded-lg p-1.5 font-diffuse outline-none hover:bg-component focus-visible:ring-3 focus-visible:ring-brand"
              >
                <XIcon className="size-5" />
              </Dialog.Close>
            </div>
          )}
          <div className="overflow-y-auto">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
