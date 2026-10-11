// custom hook (works as a vm): fetch users and municipios, keep a copy and filter it
import { useEffect, useMemo, useState } from "react"
import type { User, Role, UserCreateForm } from "@/lib/types/User"
import type { Municipio } from "@/lib/types/Municipio"
import { DEFAULT_INITIAL_PERMISSIONS, type PermissionKey } from "@/lib/types/Permission"
import { getUsers } from "@/lib/api/users"
import { getMunicipios } from "@/lib/api/municipios"

/** Gives a blank create form with the default permissions */
const EMPTY_FORM = (): UserCreateForm => ({
  nombre: "",
  apellido: "",
  correo: "",
  rol: "Alimentador",
  id_municipio: null,
  permisos: [...DEFAULT_INITIAL_PERMISSIONS],
})

// remove accents and case
/**
 * Lowercases a text and removes its accents for searching
 *
 * @param text - Text to normalize
 */
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

// toggle a permission in a copy of the list
/**
 * Adds a permission to a list, or removes it if it is there, without changing the original
 *
 * @param list - Current permissions
 * @param key - Permission to toggle
 */
const toggleKey = (list: PermissionKey[], key: PermissionKey) =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key]

// Filter states:  hook / filter

/**
 * State of the search text
 *
 * @param initial - Starting text
 */
export const useSearch = (initial: string) => useState(initial)
/**
 * State of the role filter; an empty string means all
 *
 * @param initial - Starting role
 */
export const useRoleFilter = (initial: Role | "") => useState<Role | "">(initial)

// keep the user shown in the popup
/**
 * State of the user shown in the detail popup
 *
 * @param initial - Starting user
 */
export const useSelectedUser = (initial: User | null) => useState(initial)

// keep the permission editing state
/**
 * State of the permission edit mode
 *
 * @param initial - Starting value
 */
export const useEditingPermissions = (initial: boolean) => useState(initial)
/**
 * State of the permissions being edited
 *
 * @param initial - Starting permissions
 */
export const useDraftPermissions = (initial: PermissionKey[]) => useState(initial)
/**
 * State of the delete confirmation
 *
 * @param initial - Starting value
 */
export const useConfirmingDelete = (initial: boolean) => useState(initial)

// keep the create popup state
/**
 * State of the create popup visibility
 *
 * @param initial - Starting value
 */
export const useCreateOpen = (initial: boolean) => useState(initial)
/**
 * State of the create form
 *
 * @param initial - Starting values
 */
export const useCreateForm = (initial: UserCreateForm) => useState(initial)

/**
 * View model of the users page: fetches users and municipios once, keeps a copy, filters it by name and role, and drives the detail and create popups
 *
 * @returns The loading flag, the filtered users, the search and role filters, the selected user with its permission editing and delete confirmation, and the create form with its actions
 */
export const useUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useSearch("")
  const [roleFilter, setRoleFilter] = useRoleFilter("")
  const [selectedUser, setSelectedUser] = useSelectedUser(null)
  const [editingPermissions, setEditingPermissions] = useEditingPermissions(false)
  const [draftPermissions, setDraftPermissions] = useDraftPermissions([])
  const [confirmingDelete, setConfirmingDelete] = useConfirmingDelete(false)
  const [createOpen, setCreateOpen] = useCreateOpen(false)
  const [createForm, setCreateForm] = useCreateForm(EMPTY_FORM())

  // fetch once and keep a copy
  useEffect(() => {
    Promise.all([getUsers(), getMunicipios()])
      .then(([fetchedUsers, fetchedMunicipios]) => {
        setAllUsers(fetchedUsers)
        setMunicipios(fetchedMunicipios)
      })
      .finally(() => setLoading(false))
  }, [])

  // filter the copy by name and role
  const users = useMemo(() => {
    const query = normalize(search.trim())
    return allUsers.filter(
      (u) =>
        (roleFilter === "" || u.rol === roleFilter) &&
        normalize(`${u.nombre} ${u.apellido}`).includes(query),
    )
  }, [allUsers, search, roleFilter])

  const openUser = (user: User) => {
    setSelectedUser(user)
    setDraftPermissions([...user.permisos])
    setEditingPermissions(false)
    setConfirmingDelete(false)
  }

  const closeUser = () => {
    setSelectedUser(null)
    setEditingPermissions(false)
    setConfirmingDelete(false)
  }

  const startEditingPermissions = () => setEditingPermissions(true)

  const togglePermission = (key: PermissionKey) => setDraftPermissions((prev) => toggleKey(prev, key))

  const savePermissions = () => {
    // TODO: save draftPermissions with the API
    setEditingPermissions(false)
  }

  const requestDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    // TODO: delete the selected user with the API
    closeUser()
  }

  const openCreate = () => setCreateOpen(true)

  const closeCreate = () => setCreateOpen(false)

  const updateCreateForm = <K extends keyof UserCreateForm>(field: K, value: UserCreateForm[K]) =>
    setCreateForm((prev) => ({ ...prev, [field]: value }))

  const toggleInitialPermission = (key: PermissionKey) =>
    setCreateForm((prev) => ({ ...prev, permisos: toggleKey(prev.permisos, key) }))

  const submitCreate = () => {
    // TODO: create the user with the API
    setCreateOpen(false)
    setCreateForm(EMPTY_FORM())
  }

  return {
    loading,
    users,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    selectedUser,
    openUser,
    closeUser,
    editingPermissions,
    draftPermissions,
    startEditingPermissions,
    togglePermission,
    savePermissions,
    confirmingDelete,
    requestDelete,
    createOpen,
    openCreate,
    closeCreate,
    createForm,
    updateCreateForm,
    toggleInitialPermission,
    submitCreate,
    municipios,
  }
}

export type UsersState = ReturnType<typeof useUsers>
