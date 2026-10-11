import { Popup } from "@/components/layout/Popup"
import { CheckboxField } from "@/components/ui/CheckboxField"
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect"
import { ROLES, type Role, type UserCreateForm } from "@/lib/types/User"
import type { Municipio } from "@/lib/types/Municipio"
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS, permissionsByGroup, type PermissionKey } from "@/lib/types/Permission"

interface UserCreatePopupProps {
  /** Whether the popup is visible */
  open: boolean
  /** Called when the popup is closed or cancelled */
  onClose: () => void
  /** Current values of the form */
  form: UserCreateForm
  /** Called with the field and its new value */
  onChange: <K extends keyof UserCreateForm>(field: K, value: UserCreateForm[K]) => void
  /** Called when an initial permission is toggled */
  onTogglePermission: (key: PermissionKey) => void
  /** Options of the municipio select */
  municipios: Municipio[]
  /** Called by the "Registrar usuario" button */
  onSubmit: () => void
}

const labelClass = "flex flex-col gap-1 text-sm font-clear"
const inputClass = "input-field h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"

/** Popup with the form to register a new user; an Administrador gets every permission, locked on */
export function UserCreatePopup({
  open,
  onClose,
  form,
  onChange,
  onTogglePermission,
  municipios,
  onSubmit,
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
                    setChecked={() => onTogglePermission(permission.key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-card pt-4">
          <button type="button" onClick={onClose} className="btn-secondary rounded-lg px-4 py-2 text-sm">
            Cancelar
          </button>
          <button type="button" onClick={onSubmit} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
            Registrar usuario
          </button>
        </div>
      </div>
    </Popup>
  )
}
