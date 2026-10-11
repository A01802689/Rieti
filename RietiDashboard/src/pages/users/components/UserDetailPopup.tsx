import { Popup } from "@/components/layout/Popup"
import { Toggle } from "@/components/ui/Toggle"
import type { User } from "@/lib/types/User"
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS, permissionsByGroup, type PermissionKey } from "@/lib/types/Permission"

interface UserDetailPopupProps {
  /** User shown; the popup is closed when null */
  user: User | null
  /** Called when the popup is closed */
  onClose: () => void
  /** Whether the permission switches are enabled */
  editing: boolean
  /** Permissions the switches show */
  draftPermissions: PermissionKey[]
  /** Called when a switch is toggled */
  onTogglePermission: (key: PermissionKey) => void
  /** Called by the "Editar permisos" button */
  onStartEditing: () => void
  /** Called by the "Guardar" button */
  onSave: () => void
  /** Whether the delete button asks for confirmation */
  confirmingDelete: boolean
  /** Called on every click of the delete button */
  onDelete: () => void
}

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" })

/**
 * Formats the last access date; "Sin registro" when there is none
 *
 * @param iso - ISO 8601 date or null
 */
const formatAccess = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "Sin registro")

/** Popup with the data, permissions and recent activity of a user. The permissions of an Administrador are locked on */
export function UserDetailPopup({
  user,
  onClose,
  editing,
  draftPermissions,
  onTogglePermission,
  onStartEditing,
  onSave,
  confirmingDelete,
  onDelete,
}: UserDetailPopupProps) {
  const groups = permissionsByGroup()
  const isAdmin = user?.rol === "Administrador"
  const active = isAdmin ? ALL_PERMISSION_KEYS : draftPermissions

  const activity = user
    ? [
        { label: "Reportes atendidos", value: user.actividad.reportes_atendidos },
        { label: "Casos revisados", value: user.actividad.casos_revisados },
        { label: "Notas hechas", value: user.actividad.notas_registradas },
      ]
    : []

  return (
    <Popup open={user !== null} onClose={onClose}>
      {user && (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3 pr-1">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{user.nombre} {user.apellido}</h2>
                <span className="rounded-full bg-component px-2.5 py-0.5 text-xs font-medium font-accent">
                  {user.rol ?? "Sin rol"}
                </span>
              </div>
              <p className="text-sm font-diffuse break-all">{user.correo}</p>
              <p className="text-sm font-diffuse">
                {user.municipio?.nombre ?? "Sin municipio"} · Último acceso: {formatAccess(user.ultimo_acceso)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary shrink-0 rounded-lg px-3 py-1 text-sm"
            >
              Cerrar
            </button>
          </div>

          <div className="border-t border-card pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="section-label">Permisos del sistema</span>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={editing ? onSave : onStartEditing}
                  className="btn-primary rounded-lg px-3 py-1.5 text-sm"
                >
                  {editing ? "Guardar" : "Editar permisos"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group} className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">{group}</span>
                  {groups[group].map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-clear">{permission.label}</span>
                      <Toggle
                        label={permission.label}
                        checked={active.includes(permission.key)}
                        disabled={isAdmin || !editing}
                        onChange={() => onTogglePermission(permission.key)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-card pt-4">
            <span className="section-label">Actividad reciente</span>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {activity.map((item) => (
                <div key={item.label} className="rounded-xl bg-component p-3 text-center">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs font-diffuse">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t border-card pt-4">
            <button
              type="button"
              onClick={onDelete}
              className={`${confirmingDelete ? "btn-confirm" : "btn-danger"} rounded-lg px-4 py-2 text-sm font-medium`}
            >
              {confirmingDelete ? "Confirmar" : "Eliminar usuario"}
            </button>
          </div>
        </div>
      )}
    </Popup>
  )
}
