import SideBar from "@/components/ui/SideBar"
import SearchInput from "@/components/ui/SearchInput"
import Loading from "@/components/ui/Loading"
import { NativeSelect, NativeSelectOption } from "@/components/ui/NativeSelect"
import type { Role } from "@/lib/types/User"
import { UserCard } from "./components/UserCard"
import { UserDetailPopup } from "./components/UserDetailPopup"
import { UserCreatePopup } from "./components/UserCreatePopup"
import { useUsers } from "./useUsers"

/** Users page for admins: cards with search and role filter, and the popups to see a user or create a new one */
const UsersPage = () => {
  const vm = useUsers()

  return (
    <div className="min-h-screen bg-page transition-colors duration-300">
      <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
        <SideBar />
      </div>

      <div className="min-h-screen p-3 pt-20 sm:p-6 sm:pt-20 md:ml-60 md:pt-6">
        <header className="rounded-xl bg-card px-5 py-5 shadow-sm transition-colors duration-300 sm:px-8 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1>Usuarios</h1>
            <button type="button" onClick={vm.openCreate} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
              + Dar de alta
            </button>
          </div>
        </header>

        <main className="mt-4 rounded-xl bg-panel p-4 transition-colors duration-300 sm:mt-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                className="flex-1"
                value={vm.search}
                onChange={vm.setSearch}
                placeholder="Buscar por nombre o apellido..."
                label="Buscar usuarios"
              />
              <NativeSelect
                value={vm.roleFilter}
                onChange={(e) => vm.setRoleFilter(e.target.value as Role | "")}
                aria-label="Filtrar por rol"
              >
                <NativeSelectOption value="">Todos los roles</NativeSelectOption>
                <NativeSelectOption value="Administrador">Administrador</NativeSelectOption>
                <NativeSelectOption value="Alimentador">Alimentador</NativeSelectOption>
              </NativeSelect>
            </div>

            {vm.loading ? (
              <Loading />
            ) : vm.users.length === 0 ? (
              <p className="rounded-xl bg-card p-6 text-center font-diffuse sm:p-8">
                No hay usuarios que coincidan con la búsqueda.
              </p>
            ) : (
              <section aria-label="Lista de usuarios" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vm.users.map((user) => (
                  <UserCard key={user.id_usuario} user={user} onOpen={() => vm.openUser(user)} />
                ))}
              </section>
            )}
          </div>
        </main>
      </div>

      <UserDetailPopup
        user={vm.selectedUser}
        onClose={vm.closeUser}
        editing={vm.editingPermissions}
        draftPermissions={vm.draftPermissions}
        onTogglePermission={vm.togglePermission}
        onStartEditing={vm.startEditingPermissions}
        onSave={vm.savePermissions}
        confirmingDelete={vm.confirmingDelete}
        onDelete={vm.requestDelete}
      />
      <UserCreatePopup
        open={vm.createOpen}
        onClose={vm.closeCreate}
        form={vm.createForm}
        onChange={vm.updateCreateForm}
        onTogglePermission={vm.toggleInitialPermission}
        municipios={vm.municipios}
        onSubmit={vm.submitCreate}
      />
    </div>
  )
}

export default UsersPage
