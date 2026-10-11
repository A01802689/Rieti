/*
* Alimentador permissions ("Administrador" has all of them, not editable)
* There is no "manage users" permission: it is a capability of the admin role
* Origin: explicit = visible entry/page in the dashboard, implicit = action inside a page
*/

/** Groups used as columns in the permission views */
export const PERMISSION_GROUPS = ["Reportes", "Casos", "Herramientas"] as const;

export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

export const PERMISSIONS = [
  // Reportes
  { key: "reports.view", group: "Reportes", label: "Ver reportes" }, // explicit
  { key: "reports.view_detail", group: "Reportes", label: "Ver detalle de reporte" }, // explicit
  { key: "reports.edit", group: "Reportes", label: "Editar reportes" }, // implicit
  { key: "reports.close", group: "Reportes", label: "Cerrar reportes" }, // implicit
  // pending approval: reports.triage "Aceptar, fusionar y rechazar reportes"
  // Casos
  { key: "cases.view", group: "Casos", label: "Ver casos" }, // explicit
  { key: "cases.edit", group: "Casos", label: "Editar casos y notas" }, // implicit
  { key: "cases.close", group: "Casos", label: "Cerrar casos" }, // implicit
  { key: "cases.assign", group: "Casos", label: "Asignar responsables" }, // implicit
  // pending approval: cases.urgency "Cambiar urgencia de casos", cases.transfer "Transferir casos a otro municipio"
  // Herramientas
  { key: "map.view", group: "Herramientas", label: "Ver mapa de calor" }, // explicit
  { key: "stats.view", group: "Herramientas", label: "Ver estadísticas" }, // explicit
  { key: "logs.view", group: "Herramientas", label: "Ver bitácora" }, // explicit
  { key: "data.export", group: "Herramientas", label: "Exportar datos" }, // implicit
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionKey = Permission["key"];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

/** Permissions checked by default when creating a user */
export const DEFAULT_INITIAL_PERMISSIONS: PermissionKey[] = ["reports.view", "map.view"];

/** Groups the permissions to render one column per group */
export const permissionsByGroup = (): Record<PermissionGroup, Permission[]> => ({
  Reportes: PERMISSIONS.filter((p) => p.group === "Reportes"),
  Casos: PERMISSIONS.filter((p) => p.group === "Casos"),
  Herramientas: PERMISSIONS.filter((p) => p.group === "Herramientas"),
});
