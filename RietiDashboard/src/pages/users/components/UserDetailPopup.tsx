import { Popup } from "@/components/layout/Popup"
import { Toggle } from "./Toggle"
import type { User } from "@/lib/types/User"
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS, permissionNote, permissionsByGroup, type PermissionKey } from "@/lib/types/Permission"
import { formatDateTime } from "@/lib/utilities/reportStyles"

interface UserDetailPopupProps {
  /** User shown; the popup is closed when null */
  user: User | null
  /** Called when the popup is closed */
  onClose: () => void
  /** Whether the permission switches are enabled */
  editing: boolean
  /** Permissions the switches show while editing; the rest of the time they show the ones the user has */
  draftPermissions: PermissionKey[]
  /** Called when a switch is toggled; the page applies the dependencies between permissions */
  onTogglePermission: (key: PermissionKey) => void
  /** Called by the "Editar permisos" button */
  onStartEditing: () => void
  /** Called by the "Guardar" button */
  onSave: () => void
  /** Whether the delete button asks for confirmation */
  confirmingDelete: boolean
  /** Called on every click of the delete button */
  onDelete: () => void
  /** Whether a request is running; the buttons are disabled meanwhile */
  busy: boolean
  /** Message of the last request that failed, empty when there is none */
  error: string
}

/** Popup with the data and permissions of a user. Only an Alimentador has permissions to edit: those of an Administrador are locked on */
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
  busy,
  error,
}: UserDetailPopupProps) {
  const groups = permissionsByGroup()
  const isAdmin = user?.rol === "Administrador"
  const canEditPermissions = user?.rol === "Alimentador"
  const active = isAdmin ? ALL_PERMISSION_KEYS : editing ? draftPermissions : (user?.permisos ?? [])
  const saveLabel = editing ? (busy ? "Guardando..." : "Guardar") : "Editar permisos"
  const deleteLabel = confirmingDelete ? (busy ? "Eliminando..." : "Confirmar") : "Eliminar usuario"

  return (
    <Popup open={user !== null} onClose={onClose}>
      {user && (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3 pr-1">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{user.nombre} {user.apellido}</h2>
                <span className="rounded-full bg-component px-2.5 py-0.5 text-xs font-medium font-accent">
                  {user.rol}
                </span>
              </div>
              <p className="text-sm font-diffuse break-all">{user.correo}</p>
              <p className="text-sm font-diffuse">
                {user.municipio?.nombre ?? "Sin municipio"} · Último acceso: {user.ultimo_acceso ? formatDateTime(user.ultimo_acceso) : "Sin registro"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-secondary shrink-0 rounded-lg px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>

          <div className="border-t border-card pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="section-label">Permisos del sistema</span>
              {canEditPermissions && (
                <button
                  type="button"
                  onClick={editing ? onSave : onStartEditing}
                  disabled={busy}
                  className="btn-primary rounded-lg px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveLabel}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group} className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">{group}</span>
                  {groups[group].map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between gap-2">
                      <span className="min-w-0 text-sm font-clear">
                        {permission.label}
                        {permissionNote(permission.key) && (
                          <span className="block text-xs font-diffuse">{permissionNote(permission.key)}</span>
                        )}
                      </span>
                      <Toggle
                        label={permission.label}
                        checked={active.includes(permission.key)}
                        disabled={isAdmin || !editing || busy}
                        onChange={() => onTogglePermission(permission.key)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-card pt-4">
            {error && <p className="p-0 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className={`${confirmingDelete ? "btn-confirm" : "btn-danger"} rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {deleteLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  )
}
