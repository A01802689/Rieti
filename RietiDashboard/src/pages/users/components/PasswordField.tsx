import { useId, useState } from "react"
import { CheckIcon, CircleIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { PASSWORD_REQUIREMENTS } from "@/lib/utilities/password"

interface PasswordFieldProps {
  /** Current password */
  value: string
  /** Called on every keystroke with the new text */
  onChange: (value: string) => void
  /** Extra classes for the container */
  className?: string
}

/** Password input with a show/hide button and the checklist of requirements, which marks each one as it is met */
export function PasswordField({ value, onChange, className = "" }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = useId()

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-clear">
          Contraseña *
        </label>
        <div className="relative">
          <input
            id={inputId}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            aria-describedby={`${inputId}-requirements`}
            className="input-field h-9 w-full rounded-lg border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 font-diffuse outline-none hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-400"
          >
            {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>

      <ul id={`${inputId}-requirements`} className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = requirement.test(value)
          return (
            <li
              key={requirement.label}
              className={`flex items-center gap-2 text-xs ${met ? "text-green-700 dark:text-green-400" : "font-diffuse"}`}
            >
              {met ? <CheckIcon className="size-3.5 shrink-0" aria-hidden /> : <CircleIcon className="size-3.5 shrink-0" aria-hidden />}
              {requirement.label}
              <span className="sr-only">{met ? "(cumplido)" : "(pendiente)"}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
