import type { CreatedUser, User, UserCreate } from "../types/User"
import type { PermissionKey } from "@/lib/types/Permission"
import { api } from "./client"

/**
 * Fetches the users, only for an Administrador
 *
 * @returns The users, with their municipio, last access and permissions
 */
export const getUsers = () => api<User[]>("/usuarios")

/**
 * Fetches one user, only for an Administrador
 *
 * @param id - Id of the user
 * @returns The user detail
 */
export const getUser = (id: number) => api<User>(`/usuarios/${id}`)

/**
 * Creates a user with a role, only for an Administrador
 *
 * @param user - Data of the new user
 * @returns The created user, without municipio or permissions
 * @throws ApiError 403 without permission, 404 when the municipio does not exist, 409 when the email is already registered
 */
export const createUser = (user: UserCreate) =>
  api<CreatedUser>("/usuarios", { method: "POST", body: JSON.stringify(user) })

/**
 * Replaces the permissions of an Alimentador
 *
 * @param id - Id of the user
 * @param permissions - Permissions the user will have
 * @returns The updated user
 */
export const changePermissions = (id: number, permissions: PermissionKey[]) =>
  api<User>(`/usuarios/${id}/permisos`, { method: "PUT", body: JSON.stringify({ permisos: permissions }) })

/**
 * Deletes a user; the API answers 204 without content
 *
 * @param id - Id of the user
 * @throws ApiError 404 when the user does not exist, 409 when it is the signed-in Administrador
 */
export const deleteUser = (id: number) => api<void>(`/usuarios/${id}`, { method: "DELETE" })
