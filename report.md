# Informe de auditoría: página "Usuarios" del dashboard

Fecha: 2026-10-08.

Este informe lo redactó el agente 5 a partir de la lectura del proyecto, y el orquestador lo guardó en este archivo después de verificar los puntos de la API (límites de peticiones, modelo `logs`, esquemas de usuario, `.gitignore`).

## 1. Resumen del trabajo hecho

| Agente | Responsabilidad | Archivos principales |
|---|---|---|
| 1. Orquestador | Control de acceso, autenticación real, integración | `context/auth.ts`, `context/AuthContext.tsx`, `lib/api/client.ts` (`api()` con credentials include, `ApiError`, manejo de 401), `lib/api/auth.ts`, `components/layout/RequireRole.tsx`, `App.tsx` (AuthProvider activo; `/users` protegido con `RequireRole role="Administrador"`), "Usuarios" oculto en la barra lateral para no administradores, `LoginCard` y Log Out conectados a la API |
| 2. Página de cards | Vista de cards de usuarios | `pages/users/` (página, view model, componentes propios), `SearchInput`, `Card` |
| 3. Popups | Componente popup, detalle de usuario, alta de usuario | `components/layout/Popup.tsx`, `components/ui/Toggle.tsx`, vistas en `pages/users/components`, utility `btn-confirm` |
| 4. Permisos | Catálogo de permisos | `lib/types/Permission.ts` |
| 5. Datos y tipos | Tipos y fetchers simulados | `lib/types/Municipio.ts`, `lib/types/User.ts`, `lib/types/Case.ts` (reutiliza `Municipio`), `lib/api/municipios.ts`, `lib/api/users.ts` |
| 6. Estilo | Consistencia de estilo y estructura | Revisión de todo lo anterior |

Atributos de `User`:
- Vienen de la API (`UsuarioResponse`): `id_usuario`, `nombre`, `apellido`, `correo`, `rol` (nullable) e `id_municipio` (nullable).
- Solo existen en el front: `municipio` (anidado), `ultimo_acceso`, `permisos` y `actividad`.

## 2. Inconsistencias y posibles problemas

### 2.1 Dashboard

| # | Hallazgo | Impacto |
|---|---|---|
| a | `lib/utilities/useRole.ts` lee el rol de `localStorage` (`rieti_role`), por defecto administrador, con los valores `'admin'` y `'procurador'`. El rol "Procurador" no existe en la API. Lo usan `CaseHeader`, `CaseSidePanel` y `CaseReportItem`. | Cualquiera puede volverse administrador editando `localStorage`. Los roles no coinciden con los de la API. Debe sustituirse por `useAuth` (`context/auth.ts`). |
| b | El enlace Logs de la barra lateral apunta a `/logs`, pero `App.tsx` no tiene esa ruta. Los casos no tienen entrada en la barra lateral (la ruta `/case` sí existe). | Enlace roto y navegación incompleta. |
| c | `pages/cases/Cases.tsx` tiene su propio input de búsqueda y no usa el nuevo `SearchInput`. | Duplicidad de UI. |
| d | `NativeSelect` fija `h-8` y `w-fit`, por lo que los selects se ven más bajos que los inputs. `CheckboxField` usa `setChecked: Dispatch<SetStateAction<boolean>>`, incómodo para callbacks por clave. | Inconsistencia visual y API de componente poco flexible. |
| e | `Loading` usa `h-full` y `bg-page`, y puede verse raro dentro de paneles. | Visual. |
| f | `src/lib/api/reports.ts` no compila al momento de este informe: `API_URL` sin usar y `fecthReports` sin inicializador (con typo en el nombre). Es un archivo que el usuario está editando. | `tsc` y `vite build` fallan. |
| g | Tras la integración de autenticación, el login requiere la API en ejecución. La sesión se pierde al recargar porque `GET /usuarios/me` no existe (marcado con `//!` en `lib/api/auth.ts`). | Experiencia y desarrollo local. |
| h | Las comprobaciones de rol del front (`RequireRole`, ocultar "Usuarios") son solo de experiencia de usuario. | La seguridad real debe estar en la API. |
| i | `Case.ts` exporta `Municipio` como `Pick<…, "nombre">`; los casos no traen `id_municipio` ni `clave`. | Sorpresa si se espera el municipio completo. |
| j | Nomenclatura mixta: `Caso` e `id_caso` en español y `CaseState` y `CaseUrgency` en inglés. | Menor. |
| k | `users.ts` comparte la referencia `ALL_PERMISSION_KEYS` entre los administradores. | Si el view model muta `permisos` en el sitio, cambia en todos. Conviene copiar el arreglo (el view model actual ya copia al abrir el popup). |
| l | Las fechas de `ultimo_acceso` simuladas son fijas (relativas a 2026-10-08). | Quedarán obsoletas. Formatear desde el ISO. |

### 2.2 API (solo lectura, verificado en el código)

| # | Hallazgo |
|---|---|
| a | No existe `GET /usuarios/me`. Tampoco hay listado ni detalle de usuarios, reportes, casos ni municipios. `municipio.py` solo tiene `POST /municipio`. |
| b | `POST /usuarios` es abierto (límite de 10 por minuto). `UsuarioCreate` no incluye `rol` ni `id_municipio`, así que crea usuarios con `rol` nulo: **no puede crear administradores**. `POST /usuarios/admin` sí exige `Administrador`. El login tiene límite de 5 por minuto. |
| c | `usuario.rol` es nullable (ciudadanos de la app). Un listado de usuarios debe filtrar o manejar `rol` nulo. |
| d | `usuario.correo` es `String(30)` (corto para correos institucionales) y no es único. `nombre` y `apellido` son `String(50)`. |
| e | `models/logs.py` tiene `__tablename__ = "base"` y el typo `values_callale` (debe ser `values_callable`). `before_data` y `after_data` son `nullable=False`, lo que impide registrar creaciones y borrados. La tabla no tiene fecha. |
| f | `usuario_caso` no tiene restricción de unicidad `(id_usuario, id_caso)` ni marcas de tiempo. No sirve para medir actividad ni historial. |
| g | No hay alcance por rol o municipio ni verificación de permisos en la API; los chequeos de rol son inline en cada handler. |
| h | `alembic/versions/` está vacío. Cualquier columna nueva (último acceso, permisos) requiere migración. |
| i | `POST /usuarios/admin` devuelve `UsuarioResponse`, sin permisos, último acceso ni actividad. |

### 2.3 Documentación e infraestructura

- El `README.md` raíz está desactualizado (describe Node y Express; el backend es FastAPI).
- `terraform/terraform.tfvars` está ignorado por git, lo cual es correcto. Conviene documentar que `db_password` es obligatorio y local.
- El `AuthContext` anterior usaba `/me`, `/login`, `/logout` y `{email, password}`. La API real usa `/usuarios/login` con `{correo, contrasena}`. Ya se reemplazó; verificar que no queden referencias antiguas.
- No hay suite de pruebas (`RietiAPI/tests/` vacío), por lo que las reglas de autorización no están verificadas.

## 3. Prácticas a mejorar (priorizadas)

1. **Alta:** aplicar autorización en la API: roles, alcance por municipio y permisos.
2. **Alta:** añadir `GET /usuarios/me` para no perder la sesión al recargar.
3. **Alta:** reemplazar `useRole` por `useAuth` y eliminar el rol "Procurador" y la lectura de `localStorage`.
4. **Alta:** definir la estrategia de contraseña al dar de alta usuarios.
5. **Media:** ampliar `correo`, hacerlo único y crear migraciones con Alembic.
6. **Media:** corregir `models/logs.py` y usarlo para registrar acciones y actividad.
7. **Media:** añadir unicidad y marcas de tiempo a `usuario_caso`.
8. **Media:** arreglar `reports.ts` para que `tsc` pase, y correr `tsc` y `eslint` en integración continua.
9. **Media:** registrar la ruta de Logs o quitar el enlace; añadir Casos a la barra lateral.
10. **Baja:** usar `SearchInput` en Cases; hacer `NativeSelect` configurable en alto y ancho; cambiar `CheckboxField` a `onChange(checked: boolean)`.
11. **Baja:** actualizar el README raíz y añadir pruebas a la API.

## 4. Endpoints y campos NO definidos en la API

| Necesidad | Estado | Propuesta |
|---|---|---|
| Sesión actual | No existe | `GET /usuarios/me` devolviendo `SessionUser` (idealmente con permisos) |
| Listado de usuarios | No existe | `GET /dashboard/usuarios` (solo administrador; filtrar `rol` nulo) |
| Detalle de usuario | No existe | `GET /dashboard/usuarios/{id}` con `municipio`, `ultimo_acceso`, `permisos`, `actividad` |
| Alta de usuario | `POST /usuarios/admin` existe pero exige `contrasena` | Definir cómo se genera (sección 7) |
| Editar usuario y cambiar rol o municipio | No existe | `PATCH /dashboard/usuarios/{id}` |
| Cambiar permisos | No existe | `PUT /dashboard/usuarios/{id}/permisos` |
| Eliminar usuario | No existe | `DELETE /dashboard/usuarios/{id}` (considerar baja lógica y casos asignados) |
| Último acceso | Sin columna ni registro en el login | Columna `ultimo_acceso` actualizada al hacer login |
| Modelo de permisos | No existe | Tabla `usuario_permiso` o JSONB con las claves del catálogo |
| Actividad | Sin endpoint ni agregación | Calcular desde `logs` y `usuario_caso`: reportes atendidos, casos revisados, notas |
| Listado de municipios | Solo `POST /municipio` | `GET /dashboard/municipios` (`id_municipio`, `nombre`, `clave`) |
| Reportes y casos | Sin listados ni detalle | Los fetchers actuales son datos simulados |
| Contraseña al crear | `UsuarioCreateAdmin.contrasena` obligatorio; el formulario no la tiene | Ver sección 7 |
| Municipio del administrador | `UsuarioCreateAdmin.id_municipio` es obligatorio | Decidir si un administrador debe tener municipio |
| `rol` nullable | La API lo permite | Excluir de listados o mostrar "Sin rol" |

## 5. Catálogo de permisos

Aprobados (12). El Administrador tiene todos de forma implícita y no son editables. No existe un permiso "gestionar usuarios" (es una capacidad del rol).

| Grupo | Clave | Etiqueta | Origen |
|---|---|---|---|
| Reportes | `reports.view` | Ver reportes | explícito |
| Reportes | `reports.view_detail` | Ver detalle de reporte | explícito |
| Reportes | `reports.edit` | Editar reportes | implícito |
| Reportes | `reports.close` | Cerrar reportes | implícito |
| Casos | `cases.view` | Ver casos | explícito |
| Casos | `cases.edit` | Editar casos y notas | implícito |
| Casos | `cases.close` | Cerrar casos | implícito |
| Casos | `cases.assign` | Asignar responsables | implícito |
| Herramientas | `map.view` | Ver mapa de calor | explícito |
| Herramientas | `stats.view` | Ver estadísticas | explícito |
| Herramientas | `logs.view` | Ver bitácora | explícito |
| Herramientas | `data.export` | Exportar datos | implícito |

Reglas:
- El alcance por municipio es una regla implícita: cada usuario solo ve datos de su municipio.
- `view_detail` y `edit` suponen el permiso de vista correspondiente, pero nada lo hace cumplir.

**Pendiente de decisión:** el agente 4 propuso 3 permisos extra encontrados en la interfaz existente. Están comentados en `lib/types/Permission.ts` hasta que se aprueben.

| Clave | Etiqueta |
|---|---|
| `reports.triage` | Aceptar, fusionar y rechazar reportes |
| `cases.urgency` | Cambiar urgencia de casos |
| `cases.transfer` | Transferir casos a otro municipio |

## 6. Cosas no agregadas

Visibles en las capturas pero no solicitadas, por lo que **no** se agregaron:
- Avatar circular con iniciales.
- Punto de estado (verde o gris) en las cards.
- Badge "Activo" en el popup de detalle.
- "ID: USR-001".
- Contadores "N permisos activos" (card) y "10 de 10 permisos activos" (detalle).
- Subtítulo "N usuarios registrados".
- Select "Puesto / Cargo" en el popup de alta.
- Campo único "Nombre completo" (se sustituyó por nombre(s) y apellido(s), según la especificación).
- Columna de permisos "Administración" (Gestionar usuarios, Acceso administrativo), que no está en el catálogo.
- Etiqueta "Zona" (la interfaz dice "Municipio").
- Campo de contraseña (la API lo exige; el formulario no lo tiene).

Agregado aunque no se pidió literalmente:
- Chip de rol en las cards (aprobado por el usuario).
- Botón "Ver perfil →", select de filtro por rol y búsqueda (solicitados después por el usuario).
- Botón "Cancelar" y X en el popup de alta (necesarios para cerrarlo).
- Botón "Cerrar" en el popup de detalle (no tiene título ni X).
- Botón de eliminar en el popup de detalle y no en el de alta (la especificación lo ponía en el de alta; el usuario confirmó el cambio).
- Permisos del Administrador mostrados bloqueados y botón "Editar permisos" oculto para administradores (decisión del agente 3).

## 7. Decisiones pendientes para el usuario

1. Aprobar o rechazar los 3 permisos extra: `reports.triage`, `cases.urgency` y `cases.transfer`.
2. Estrategia de contraseña al dar de alta un usuario. Opciones: campo de contraseña inicial en el formulario, contraseña temporal generada por el servidor con cambio obligatorio, o invitación por correo con enlace.
3. Añadir `GET /usuarios/me` en la API (hoy la sesión se pierde al recargar). No se tocó la API, por indicación expresa.
4. Reemplazar `useRole` por `useAuth` en `CaseHeader`, `CaseSidePanel` y `CaseReportItem`.
5. Migrar la búsqueda de Cases a `SearchInput`.
6. Decidir si un administrador debe tener municipio asignado (hoy la API lo exige).
