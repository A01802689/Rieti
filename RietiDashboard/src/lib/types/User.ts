/*
* JSON de Usuario, endpoint (/dashboard/usuarios/{id})
{
  "id_usuario": "number",
  "nombre": "string",
  "apellido": "string",
  "correo": "string",
  "rol": "'Administrador' | 'Alimentador' | null",
  "id_municipio": "number | null",
  "municipio": {
    "id_municipio": "number",
    "nombre": "string",
    "clave": "string"
  } | null,
  "ultimo_acceso": "string (ISO 8601 TIMESTAMP) | null",
  "permisos": "PermissionKey[] (ver lib/types/Permission.ts)",
  "actividad": {
    "reportes_atendidos": "number",
    "casos_revisados": "number",
    "notas_registradas": "number"
  }
}
* JSON de Usuario, endpoint (/dashboard/usuarios)
[{
  "id_usuario": "number",
  "nombre": "string",
  "apellido": "string",
  "correo": "string",
  "rol": "'Administrador' | 'Alimentador' | null",
  "id_municipio": "number | null",
  "municipio": {
    "id_municipio": "number",
    "nombre": "string",
    "clave": "string"
  } | null,
  "ultimo_acceso": "string (ISO 8601 TIMESTAMP) | null",
  "permisos": "PermissionKey[] (ver lib/types/Permission.ts)"
}, ...]
* JSON de alta de Usuario, endpoint POST (/dashboard/usuarios)
{
  "nombre": "string",
  "apellido": "string",
  "correo": "string",
  "rol": "'Administrador' | 'Alimentador'",
  "id_municipio": "number",
  "permisos": "PermissionKey[]"
}

* Respuesta del alta de Usuario, endpoint POST (/dashboard/usuarios)
el Usuario creado (mismo JSON que un elemento de la lista)

* JSON de Usuario de la sesión, endpoint GET (/usuarios/me) (propuesto: hoy la sesión se pierde al recargar)
{
  "id_usuario": "number",
  "nombre": "string",
  "apellido": "string",
  "correo": "string",
  "rol": "'Administrador' | 'Alimentador' | null",
  "id_municipio": "number | null"
}

* Cambiar los permisos de un Usuario, endpoint PUT (/dashboard/usuarios/{id}/permisos) (propuesto)
cuerpo:
{
  "permisos": "PermissionKey[]"
}
respuesta: el Usuario completo (JSON de GET /dashboard/usuarios/{id})

* Eliminar un Usuario, endpoint DELETE (/dashboard/usuarios/{id}) (propuesto)
sin cuerpo; respuesta 204 sin contenido

* Cerrar la sesión, endpoint POST (/usuarios/logout) (ya existe en la API)
sin cuerpo; respuesta:
{
  "message": "string"
}
*/

import type { Municipio } from "./Municipio";
import type { PermissionKey } from "@/lib/types/Permission";

/** Roles of the API */
export const ROLES = ["Administrador", "Alimentador"] as const;

export type Role = (typeof ROLES)[number];

/** User of the session, as the API login returns it */
export interface SessionUser {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  rol: Role | null
  id_municipio: number | null
}

/** Work done by a user */
export interface UserActivity {
  reportes_atendidos: number
  casos_revisados: number
  notas_registradas: number
}

/** User shown in the users page; municipio, ultimo_acceso, permisos and actividad exist only in the front for now */
export interface User extends SessionUser {
  municipio: Municipio | null
  ultimo_acceso: string | null // ISO 8601 TIMESTAMP
  permisos: PermissionKey[]
  actividad: UserActivity // omitted by the list endpoint in the real API
}

/** Payload to create a user (the API also needs contrasena) */
export interface UserCreate {
  nombre: string
  apellido: string
  correo: string
  rol: Role
  id_municipio: number
  permisos: PermissionKey[]
}

/** State of the create form while it is being filled */
export interface UserCreateForm {
  nombre: string
  apellido: string
  correo: string
  rol: Role
  id_municipio: number | null
  permisos: PermissionKey[]
}
