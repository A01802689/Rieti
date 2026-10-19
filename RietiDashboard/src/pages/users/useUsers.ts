import { useEffect, useMemo, useState } from "react"
import type { User, Role, UserCreate } from "@/lib/types/User"
import type { Municipio } from "@/lib/types/Municipio"
import { DEFAULT_INITIAL_PERMISSIONS, togglePermissionKey, type PermissionKey } from "@/lib/types/Permission"
import { ApiError } from "@/lib/api/client"
import { changePermissions, createUser, deleteUser, getUser, getUsers } from "@/lib/api/users"
import { getMunicipios } from "@/lib/api/municipios"
import { isValidPassword } from "@/lib/utilities/password"
import { normalizeText } from "@/lib/utilities/text"

/**
 * Gives a blank create form with the default permissions
 *
 * @returns A new form, so no two forms share the permissions array
 */
const EMPTY_FORM = (): UserCreate => ({
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  rol: "Alimentador",
  id_municipio: null,
  permisos: [...DEFAULT_INITIAL_PERMISSIONS],
})

/**
 * Gives the message to show for a failed request
 *
 * @param error - What the request threw
 * @param fallback - Message used when the error does not come from the API, e.g. the network is down
 * @returns The `detail` the API sent, or the fallback
 */
const errorMessage = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback)

/**
 * Tells if the create form has every required field and a password that follows the rule
 *
 * @param form - Values of the create form
 * @returns True when the user can be registered
 */
const isCreateFormValid = (form: UserCreate) =>
  form.nombre.trim() !== "" &&
  form.apellido.trim() !== "" &&
  /^\S+@\S+\.\S+$/.test(form.correo.trim()) &&
  form.id_municipio !== null &&
  isValidPassword(form.contrasena)

/**
 * State of the search text
 *
 * @param initial - Starting text
 * @returns The value and its setter
 */
export const useSearch = (initial: string) => useState(initial)

/**
 * State of the role filter; an empty string means all
 *
 * @param initial - Starting role
 * @returns The value and its setter
 */
export const useRoleFilter = (initial: Role | "") => useState<Role | "">(initial)

/**
 * State of the user shown in the detail popup
 *
 * @param initial - Starting user
 * @returns The value and its setter
 */
export const useSelectedUser = (initial: User | null) => useState(initial)

/**
 * State of the permission edit mode
 *
 * @param initial - Starting value
 * @returns The value and its setter
 */
export const useEditingPermissions = (initial: boolean) => useState(initial)
/**
 * State of the permissions being edited
 *
 * @param initial - Starting permissions
 * @returns The value and its setter
 */
export const useDraftPermissions = (initial: PermissionKey[]) => useState(initial)
/**
 * State of the delete confirmation
 *
 * @param initial - Starting value
 * @returns The value and its setter
 */
export const useConfirmingDelete = (initial: boolean) => useState(initial)

/**
 * State of the create popup visibility
 *
 * @param initial - Starting value
 * @returns The value and its setter
 */
export const useCreateOpen = (initial: boolean) => useState(initial)
/**
 * State of the create form
 *
 * @param initial - Starting values
 * @returns The value and its setter
 */
export const useCreateForm = (initial: UserCreate) => useState(initial)

/**
 * View model of the users page: fetches users and municipios, keeps a copy that the filters work on, and drives the detail and create popups, whose changes are sent to the API
 *
 * @returns The loading and failure flags, the filtered users, the search and role filters, the selected user with its permission editing, delete confirmation, request state and error, and the create form with its validity, request state, error and actions
 */
export const useUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  const [search, setSearch] = useSearch("")
  const [roleFilter, setRoleFilter] = useRoleFilter("")
  const [selectedUser, setSelectedUser] = useSelectedUser(null)
  const [editingPermissions, setEditingPermissions] = useEditingPermissions(false)
  const [draftPermissions, setDraftPermissions] = useDraftPermissions([])
  const [confirmingDelete, setConfirmingDelete] = useConfirmingDelete(false)
  const [detailBusy, setDetailBusy] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [createOpen, setCreateOpen] = useCreateOpen(false)
  const [createForm, setCreateForm] = useCreateForm(EMPTY_FORM())
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  // fetch once and keep a copy, which the filters work on
  useEffect(() => {
    // the answer of an effect that was cleaned up (StrictMode) is dropped
    let ignore = false

    const getData = async () => {
      try {
        const [fetchedUsers, fetchedMunicipios] = await Promise.all([getUsers(), getMunicipios()])
        if (ignore) return
        setAllUsers(fetchedUsers)
        setMunicipios(fetchedMunicipios)
      } catch (e) {
        console.error(`Error fetching users and municipios from api ${e}`)
        if (!ignore) setLoadFailed(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    getData()
    return () => {
      ignore = true
    }
  }, [])

  const users = useMemo(() => {
    const query = normalizeText(search.trim())
    return allUsers.filter(
      (u) =>
        (roleFilter === "" || u.rol === roleFilter) &&
        normalizeText(`${u.nombre} ${u.apellido}`).includes(query),
    )
  }, [allUsers, search, roleFilter])

  /** Fetches the users again; the list on screen stays while the answer arrives */
  const reloadUsers = async () => {
    try {
      setAllUsers(await getUsers())
    } catch (e) {
      console.error(`Error reloading users from api ${e}`)
    }
  }

  /**
   * Puts a user that the API just sent in the list, and in the detail popup if that user is the one shown
   *
   * @param fresh - User as the API returns it
   */
  const replaceUser = (fresh: User) => {
    setAllUsers((prev) => prev.map((u) => (u.id_usuario === fresh.id_usuario ? fresh : u)))
    setSelectedUser((current) => (current?.id_usuario === fresh.id_usuario ? fresh : current))
  }

  /**
   * Opens the detail popup of a user, and then refreshes its data with the API
   *
   * @param user - User picked in the list
   */
  const openUser = (user: User) => {
    setSelectedUser(user)
    setEditingPermissions(false)
    setConfirmingDelete(false)
    setDetailError("")
    getUser(user.id_usuario)
      .then(replaceUser)
      .catch((e) => console.error(`Error fetching the user from api ${e}`))
  }

  /** Hides the detail popup and leaves the edit and delete modes */
  const resetUser = () => {
    setSelectedUser(null)
    setEditingPermissions(false)
    setConfirmingDelete(false)
    setDetailError("")
  }

  /** Closes the detail popup, unless a request of the popup is still running */
  const closeUser = () => {
    if (!detailBusy) resetUser()
  }

  /** Enables the permission switches of the detail popup, starting from the permissions the user has */
  const startEditingPermissions = () => {
    if (!selectedUser) return
    setDraftPermissions([...selectedUser.permisos])
    setEditingPermissions(true)
    setDetailError("")
  }

  /**
   * Toggles a permission in the draft; granting one also grants the permission it requires and revoking one revokes the ones that require it
   *
   * @param key - Permission to toggle
   */
  const togglePermission = (key: PermissionKey) => setDraftPermissions((prev) => togglePermissionKey(prev, key))

  /** Saves the draft permissions with the API; if it fails the error is shown and the edit mode stays on */
  const savePermissions = async () => {
    if (!selectedUser || detailBusy) return
    setDetailBusy(true)
    setDetailError("")
    try {
      replaceUser(await changePermissions(selectedUser.id_usuario, draftPermissions))
      setEditingPermissions(false)
    } catch (e) {
      setDetailError(errorMessage(e, "No se pudieron guardar los permisos"))
    } finally {
      setDetailBusy(false)
    }
  }

  /** Asks for confirmation on the first call and deletes the user with the API on the second; if it fails the error is shown and the confirmation is dropped */
  const requestDelete = async () => {
    if (!selectedUser || detailBusy) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    const { id_usuario } = selectedUser
    setDetailBusy(true)
    setDetailError("")
    try {
      await deleteUser(id_usuario)
      setAllUsers((prev) => prev.filter((u) => u.id_usuario !== id_usuario))
      resetUser()
    } catch (e) {
      setDetailError(errorMessage(e, "No se pudo eliminar al usuario"))
      setConfirmingDelete(false)
    } finally {
      setDetailBusy(false)
    }
  }

  /** Opens the create popup */
  const openCreate = () => setCreateOpen(true)

  /** Hides the create popup and clears the form, so a typed password does not stay in memory */
  const resetCreate = () => {
    setCreateOpen(false)
    setCreateForm(EMPTY_FORM())
    setCreateError("")
  }

  /** Closes the create popup, unless the user is being registered */
  const closeCreate = () => {
    if (!creating) resetCreate()
  }

  /** Sets one field of the create form */
  const updateCreateForm = <K extends keyof UserCreate>(field: K, value: UserCreate[K]) =>
    setCreateForm((prev) => ({ ...prev, [field]: value }))

  /**
   * Toggles a permission of the user being created, following the same dependencies as the draft
   *
   * @param key - Permission to toggle
   */
  const toggleInitialPermission = (key: PermissionKey) =>
    setCreateForm((prev) => ({ ...prev, permisos: togglePermissionKey(prev.permisos, key) }))

  /** Whether the create form can be sent */
  const canSubmitCreate = isCreateFormValid(createForm)

  /** Registers the user with the API, then closes the popup and reloads the list; if it fails the error is shown and the form is kept */
  const submitCreate = async () => {
    if (!canSubmitCreate || creating) return
    setCreating(true)
    setCreateError("")
    try {
      await createUser(createForm)
      resetCreate()
      reloadUsers()
    } catch (e) {
      setCreateError(errorMessage(e, "No se pudo registrar al usuario"))
    } finally {
      setCreating(false)
    }
  }

  return {
    loading,
    loadFailed,
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
    detailBusy,
    detailError,
    createOpen,
    openCreate,
    closeCreate,
    createForm,
    updateCreateForm,
    toggleInitialPermission,
    canSubmitCreate,
    submitCreate,
    creating,
    createError,
    municipios,
  }
}
