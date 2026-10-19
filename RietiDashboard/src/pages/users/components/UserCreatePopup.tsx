import { Popup } from "@/components/layout/Popup"
import { CheckboxField } from "@/components/ui/CheckboxField"
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect"
import { ROLES, type Role, type UserCreate } from "@/lib/types/User"
import type { Municipio } from "@/lib/types/Municipio"
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS, permissionNote, permissionsByGroup, type PermissionKey } from "@/lib/types/Permission"
import { PasswordField } from "./PasswordField"

interface UserCreatePopupProps {
  /** Whether the popup is visible */
  open: boolean
  /** Called when the popup is closed or cancelled */
  onClose: () => void
  /** Current values of the form */
  form: UserCreate
  /** Called with the field and its new value */
  onChange: <K extends keyof UserCreate>(field: K, value: UserCreate[K]) => void
  /** Called when an initial permission is toggled; the form applies the dependencies between permissions */
  onTogglePermission: (key: PermissionKey) => void
  /** Options of the municipio select */
  municipios: Municipio[]
  /** Whether every field is valid; the "Registrar usuario" button stays disabled until then */
  canSubmit: boolean
  /** Called by the "Registrar usuario" button */
  onSubmit: () => void
  /** Whether the user is being registered; the buttons are disabled meanwhile */
  submitting: boolean
  /** Message of the last registration that failed, empty when there is none */
  error: string
}

/** Classes of the label that wraps each field */
const labelClass = "flex flex-col gap-1 text-sm font-clear"
/** Classes of the text inputs */
const inputClass = "input-field h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"

/** Popup with the form to register a new user, including a password that follows the rule; an Administrador gets every permission, locked on */
export function UserCreatePopup({
  open,
  onClose,
  form,
  onChange,
  onTogglePermission,
  municipios,
  canSubmit,
  onSubmit,
  submitting,
  error,
}: UserCreatePopupProps) {
  const groups = permissionsByGroup()
  const isAdmin = form.rol === "Administrador"
  const active = isAdmin ? ALL_PERMISSION_KEYS : form.permisos

  return (
    <Popup
      open={open}
      onClose={onClose}
      title="Dar de alta usuario"
      description="Solo administradores pueden registrar nuevos usuarios"
    >
      <div className="flex flex-col gap-5 p-5">
        <span className="section-label">Datos personales</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Nombre(s) *
            <input
              className={inputClass}
              value={form.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Apellido(s) *
            <input
              className={inputClass}
              value={form.apellido}
              onChange={(e) => onChange("apellido", e.target.value)}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Correo electrónico *
            <input
              type="email"
              placeholder="usuario@dominio.mx"
              className={inputClass}
              value={form.correo}
              onChange={(e) => onChange("correo", e.target.value)}
            />
          </label>
          <PasswordField
            className="sm:col-span-2"
            value={form.contrasena}
            onChange={(value) => onChange("contrasena", value)}
          />
          <label className={labelClass}>
            Rol del sistema *
            <NativeSelect
              className="w-full"
              value={form.rol}
              onChange={(e) => onChange("rol", e.target.value as Role)}
            >
              {ROLES.map((rol) => (
                <NativeSelectOption key={rol} value={rol}>{rol}</NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className={labelClass}>
            Municipio asignado *
            <NativeSelect
              className="w-full"
              value={form.id_municipio ?? ""}
              onChange={(e) => onChange("id_municipio", e.target.value === "" ? null : Number(e.target.value))}
            >
              <NativeSelectOption value="">Seleccionar</NativeSelectOption>
              {municipios.map((municipio) => (
                <NativeSelectOption key={municipio.id_municipio} value={municipio.id_municipio}>
                  {municipio.nombre}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        </div>

        <div className="border-t border-card pt-4">
          <span className="section-label">Permisos iniciales</span>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group} className="flex flex-col">
                <span className="mb-1 text-sm font-semibold">{group}</span>
                {groups[group].map((permission) => (
                  <CheckboxField
                    key={permission.key}
                    label={permission.label}
                    checked={active.includes(permission.key)}
                    disabled={isAdmin}
                    hint={permissionNote(permission.key)}
                    setChecked={() => onTogglePermission(permission.key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-card pt-4">
          {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Registrando..." : "Registrar usuario"}
            </button>
          </div>
        </div>
      </div>
    </Popup>
  )
}
