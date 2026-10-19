/** Groups used as columns in the permission views */
export const PERMISSION_GROUPS = ["Reportes", "Casos", "Herramientas"] as const

/** Name of a permission group */
export type PermissionGroup = (typeof PERMISSION_GROUPS)[number]

/** Known permission keys, including legacy keys retained for compatibility */
export const PERMISSIONS = [
  // Reportes
  { key: "reports.view", group: "Reportes", label: "Ver reportes" }, // explicit
  { key: "reports.view_detail", group: "Reportes", label: "Ver detalle de reporte" }, // explicit
  { key: "reports.edit", group: "Reportes", label: "Editar reportes" }, // implicit
  { key: "reports.close", group: "Reportes", label: "Cerrar reportes" }, // implicit

  // Casos
  { key: "cases.view", group: "Casos", label: "Ver casos" }, // explicit
  { key: "cases.edit", group: "Casos", label: "Editar casos y notas" }, // implicit
  { key: "cases.close", group: "Casos", label: "Cerrar casos" }, // implicit
  { key: "cases.assign", group: "Casos", label: "Asignar responsables" }, // implicit

  // Herramientas
  { key: "map.view", group: "Herramientas", label: "Ver mapa de calor" }, // explicit
  { key: "stats.view", group: "Herramientas", label: "Ver estadísticas" }, // explicit
  { key: "logs.view", group: "Herramientas", label: "Ver bitácora" }, // explicit
] as const

/** One permission with its key, group and label */
export type Permission = (typeof PERMISSIONS)[number]

/** Key that identifies a permission */
export type PermissionKey = Permission["key"]

/** Known keys, including admin capabilities represented by legacy keys */
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key)

/** Legacy permission keys whose actions now belong exclusively to the admin role */
export const ADMIN_ONLY_PERMISSIONS: PermissionKey[] = ["logs.view"]

/** Permissions checked by default when creating a user */
export const DEFAULT_INITIAL_PERMISSIONS: PermissionKey[] = ["reports.view", "map.view"]

/** Permission that has to be granted together with each of these ones, because their actions live in a page it opens */
export const PERMISSION_REQUIRES: Partial<Record<PermissionKey, PermissionKey>> = {
  "reports.edit": "reports.view",
  "reports.close": "reports.view",
  "cases.edit": "cases.view",
  "cases.close": "cases.view",
  "cases.assign": "cases.view",
}

/**
 * Gives the name of a permission
 *
 * @param key - Permission to name
 * @returns Its label
 */
const labelOf = (key: PermissionKey) => PERMISSIONS.find((p) => p.key === key)?.label ?? key

/**
 * Gives the note shown under a permission in the editors
 *
 * @param key - Permission to describe
 * @returns The permission it requires, or undefined when it requires none
 */
export const permissionNote = (key: PermissionKey): string | undefined => {
  const required = PERMISSION_REQUIRES[key]
  if (required) return `Requiere: ${labelOf(required)}`
  return undefined
}

/**
 * Adds a permission to a list together with the one it requires, without changing the original
 *
 * @param list - Current permissions
 * @param key - Permission to grant
 * @returns A new list with the permission and its requirement
 */
export const grantPermission = (list: PermissionKey[], key: PermissionKey): PermissionKey[] => {
  if (ADMIN_ONLY_PERMISSIONS.includes(key)) return list
  const next = list.includes(key) ? list : [...list, key]
  const required = PERMISSION_REQUIRES[key]
  return required ? grantPermission(next, required) : next
}

/**
 * Removes a permission from a list together with the ones that require it, without changing the original
 *
 * @param list - Current permissions
 * @param key - Permission to revoke
 * @returns A new list without the permission and its dependents
 */
export const revokePermission = (list: PermissionKey[], key: PermissionKey): PermissionKey[] =>
  PERMISSIONS.filter((p) => PERMISSION_REQUIRES[p.key] === key).reduce(
    (current, dependent) => revokePermission(current, dependent.key),
    list.filter((k) => k !== key),
  )

/**
 * Grants a permission that is not in the list, or revokes it if it is, following the dependencies
 *
 * @param list - Current permissions
 * @param key - Permission to toggle
 * @returns A new list with the change
 */
export const togglePermissionKey = (list: PermissionKey[], key: PermissionKey) =>
  list.includes(key) ? revokePermission(list, key) : grantPermission(list, key)

/**
 * Groups the permissions to render one column per group
 *
 * @returns The permissions of each group
 */
export const permissionsByGroup = (): Record<PermissionGroup, Permission[]> => ({
  Reportes: PERMISSIONS.filter((p) => p.group === "Reportes"),
  Casos: PERMISSIONS.filter((p) => p.group === "Casos"),
  Herramientas: PERMISSIONS.filter((p) => p.group === "Herramientas" && !ADMIN_ONLY_PERMISSIONS.includes(p.key)),
})
