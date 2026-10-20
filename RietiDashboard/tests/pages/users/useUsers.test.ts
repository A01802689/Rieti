import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { getMunicipios } from '@/lib/api/municipios'
import { changePermissions, createUser, deleteUser, getUser, getUsers } from '@/lib/api/users'
import { useUsers } from '@/pages/users/useUsers'
import { makeStoredUser } from '../../helpers/fixtures'

vi.mock('@/lib/api/users', () => ({
  getUsers: vi.fn(),
  getUser: vi.fn(),
  createUser: vi.fn(),
  changePermissions: vi.fn(),
  deleteUser: vi.fn(),
}))
vi.mock('@/lib/api/municipios', () => ({ getMunicipios: vi.fn() }))

const municipios = [{ id_municipio: 1, nombre: 'Atizapán', clave: '013' }]
const ana = makeStoredUser({ id_usuario: 1, nombre: 'Ana', apellido: 'Árbol', rol: 'Administrador', permisos: [] })
const luis = makeStoredUser({ id_usuario: 2, nombre: 'Luis', apellido: 'Gómez', permisos: ['reports.view', 'reports.edit'] })

beforeEach(() => {
  vi.mocked(getUsers).mockReset().mockResolvedValue([ana, luis])
  vi.mocked(getUser).mockReset().mockResolvedValue(luis)
  vi.mocked(createUser).mockReset()
  vi.mocked(changePermissions).mockReset()
  vi.mocked(deleteUser).mockReset()
  vi.mocked(getMunicipios).mockReset().mockResolvedValue(municipios)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const load = async () => {
  const hook = renderHook(() => useUsers())
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

const fillValid = (result: { current: ReturnType<typeof useUsers> }) => {
  act(() => {
    result.current.updateCreateForm('nombre', 'Eva')
    result.current.updateCreateForm('apellido', 'Ruiz')
    result.current.updateCreateForm('correo', 'eva@correo.mx')
    result.current.updateCreateForm('contrasena', 'Secreta1!')
    result.current.updateCreateForm('id_municipio', 1)
  })
}

describe('useUsers: carga y filtros', () => {
  it('carga usuarios y municipios', async () => {
    const { result } = await load()
    expect(result.current.users).toHaveLength(2)
    expect(result.current.municipios).toEqual(municipios)
    expect(result.current.loadFailed).toBe(false)
  })

  it('si la carga falla marca loadFailed y deja de cargar', async () => {
    vi.mocked(getUsers).mockRejectedValue(new ApiError(500, 'x'))
    const { result } = await load()
    expect(result.current.loadFailed).toBe(true)
    expect(result.current.users).toEqual([])
  })

  it('busca por nombre y apellido sin acentos ni mayúsculas', async () => {
    const { result } = await load()
    act(() => result.current.setSearch('ARBOL'))
    expect(result.current.users.map((u) => u.id_usuario)).toEqual([1])
    act(() => result.current.setSearch('  luis gomez '))
    expect(result.current.users.map((u) => u.id_usuario)).toEqual([2])
    act(() => result.current.setSearch('zzz'))
    expect(result.current.users).toEqual([])
  })

  it('no busca por correo', async () => {
    const { result } = await load()
    act(() => result.current.setSearch('luis@correo'))
    expect(result.current.users).toEqual([])
  })

  it('filtra por rol y vacío significa todos', async () => {
    const { result } = await load()
    act(() => result.current.setRoleFilter('Alimentador'))
    expect(result.current.users.map((u) => u.id_usuario)).toEqual([2])
    act(() => result.current.setRoleFilter(''))
    expect(result.current.users).toHaveLength(2)
  })
})

describe('useUsers: detalle y permisos', () => {
  it('abrir un usuario lo muestra y refresca sus datos con la API', async () => {
    vi.mocked(getUser).mockResolvedValue({ ...luis, nombre: 'Luis Fresco' })
    const { result } = await load()
    act(() => result.current.openUser(luis))
    expect(result.current.selectedUser?.nombre).toBe('Luis')
    await waitFor(() => expect(result.current.selectedUser?.nombre).toBe('Luis Fresco'))
    expect(result.current.users.find((u) => u.id_usuario === 2)?.nombre).toBe('Luis Fresco')
  })

  it('si refrescar falla deja los datos que tenía', async () => {
    vi.mocked(getUser).mockRejectedValue(new ApiError(404, 'x'))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(result.current.selectedUser).toEqual(luis)
  })

  it('startEditingPermissions copia los permisos del usuario', async () => {
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    expect(result.current.editingPermissions).toBe(true)
    expect(result.current.draftPermissions).toEqual(['reports.view', 'reports.edit'])
    expect(result.current.draftPermissions).not.toBe(luis.permisos)
  })

  it('startEditingPermissions sin usuario no hace nada', async () => {
    const { result } = await load()
    act(() => result.current.startEditingPermissions())
    expect(result.current.editingPermissions).toBe(false)
  })

  it('togglePermission aplica las dependencias', async () => {
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    act(() => result.current.togglePermission('reports.view'))
    expect(result.current.draftPermissions).toEqual([])
    act(() => result.current.togglePermission('cases.assign'))
    expect(result.current.draftPermissions).toEqual(['cases.assign', 'cases.view'])
  })

  it('savePermissions guarda, actualiza la lista y sale del modo edición', async () => {
    const saved = { ...luis, permisos: ['map.view' as const] }
    vi.mocked(changePermissions).mockResolvedValue(saved)
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    await act(async () => result.current.savePermissions())
    expect(changePermissions).toHaveBeenCalledWith(2, ['reports.view', 'reports.edit'])
    expect(result.current.editingPermissions).toBe(false)
    expect(result.current.selectedUser?.permisos).toEqual(['map.view'])
    expect(result.current.detailBusy).toBe(false)
  })

  it('si guardar falla muestra el error y sigue editando', async () => {
    vi.mocked(changePermissions).mockRejectedValue(new ApiError(400, 'No se puede'))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    await act(async () => result.current.savePermissions())
    expect(result.current.detailError).toBe('No se puede')
    expect(result.current.editingPermissions).toBe(true)
  })

  it('un error que no es de la API usa el mensaje general', async () => {
    vi.mocked(changePermissions).mockRejectedValue(new TypeError('red'))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    await act(async () => result.current.savePermissions())
    expect(result.current.detailError).toBe('No se pudieron guardar los permisos')
  })

  it('savePermissions sin usuario no llama a la API', async () => {
    const { result } = await load()
    await act(async () => result.current.savePermissions())
    expect(changePermissions).not.toHaveBeenCalled()
  })

  it('closeUser cierra y limpia, salvo que haya una petición en curso', async () => {
    let finish: (value: typeof luis) => void = () => undefined
    vi.mocked(changePermissions).mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    act(() => result.current.startEditingPermissions())
    let saving: Promise<void> | undefined
    act(() => {
      saving = result.current.savePermissions()
    })
    act(() => result.current.closeUser())
    expect(result.current.selectedUser).not.toBeNull()
    await act(async () => {
      finish(luis)
      await saving
    })
    act(() => result.current.closeUser())
    expect(result.current.selectedUser).toBeNull()
    expect(result.current.editingPermissions).toBe(false)
  })
})

describe('useUsers: eliminar', () => {
  it('el primer intento pide confirmación y el segundo elimina', async () => {
    vi.mocked(deleteUser).mockResolvedValue(undefined)
    const { result } = await load()
    act(() => result.current.openUser(luis))
    await act(async () => result.current.requestDelete())
    expect(result.current.confirmingDelete).toBe(true)
    expect(deleteUser).not.toHaveBeenCalled()
    await act(async () => result.current.requestDelete())
    expect(deleteUser).toHaveBeenCalledWith(2)
    expect(result.current.users.map((u) => u.id_usuario)).toEqual([1])
    expect(result.current.selectedUser).toBeNull()
  })

  it('si falla muestra el error y suelta la confirmación', async () => {
    vi.mocked(deleteUser).mockRejectedValue(new ApiError(409, 'No puedes eliminarte'))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    await act(async () => result.current.requestDelete())
    await act(async () => result.current.requestDelete())
    expect(result.current.detailError).toBe('No puedes eliminarte')
    expect(result.current.confirmingDelete).toBe(false)
    expect(result.current.users).toHaveLength(2)
  })

  it('un error ajeno a la API usa el mensaje general', async () => {
    vi.mocked(deleteUser).mockRejectedValue(new TypeError('red'))
    const { result } = await load()
    act(() => result.current.openUser(luis))
    await act(async () => result.current.requestDelete())
    await act(async () => result.current.requestDelete())
    expect(result.current.detailError).toBe('No se pudo eliminar al usuario')
  })

  it('sin usuario seleccionado no hace nada', async () => {
    const { result } = await load()
    await act(async () => result.current.requestDelete())
    expect(result.current.confirmingDelete).toBe(false)
  })

  it('abrir otro usuario reinicia la confirmación', async () => {
    const { result } = await load()
    act(() => result.current.openUser(luis))
    await act(async () => result.current.requestDelete())
    act(() => result.current.openUser(ana))
    expect(result.current.confirmingDelete).toBe(false)
  })
})

describe('useUsers: alta', () => {
  it('el formulario empieza vacío con los permisos por defecto', async () => {
    const { result } = await load()
    expect(result.current.createForm).toMatchObject({ nombre: '', rol: 'Alimentador', id_municipio: null, permisos: ['reports.view', 'map.view'] })
    expect(result.current.canSubmitCreate).toBe(false)
  })

  it('openCreate y closeCreate abren y cierran, y cerrar limpia el formulario', async () => {
    const { result } = await load()
    act(() => result.current.openCreate())
    expect(result.current.createOpen).toBe(true)
    fillValid(result)
    act(() => result.current.closeCreate())
    expect(result.current.createOpen).toBe(false)
    expect(result.current.createForm.contrasena).toBe('')
  })

  it('el formulario vacío no se puede enviar y submitCreate no llama a la API', async () => {
    const { result } = await load()
    await act(async () => result.current.submitCreate())
    expect(createUser).not.toHaveBeenCalled()
  })

  it.each([
    ['nombre', 'nombre', '   '],
    ['apellido', 'apellido', ''],
    ['correo sin punto', 'correo', 'eva@correo'],
    ['correo con espacio', 'correo', 'eva @correo.mx'],
    ['contraseña débil', 'contrasena', 'abcdefgh'],
    ['municipio', 'id_municipio', null],
  ] as const)('con %s inválido no se puede enviar', async (_name, field, value) => {
    const { result } = await load()
    fillValid(result)
    expect(result.current.canSubmitCreate).toBe(true)
    act(() => result.current.updateCreateForm(field, value as never))
    expect(result.current.canSubmitCreate).toBe(false)
  })

  it('el correo con espacios alrededor sí cuenta como válido', async () => {
    const { result } = await load()
    fillValid(result)
    act(() => result.current.updateCreateForm('correo', '  eva@correo.mx  '))
    expect(result.current.canSubmitCreate).toBe(true)
  })

  it('toggleInitialPermission sigue las dependencias', async () => {
    const { result } = await load()
    act(() => result.current.toggleInitialPermission('cases.close'))
    expect(result.current.createForm.permisos).toEqual(['reports.view', 'map.view', 'cases.close', 'cases.view'])
    act(() => result.current.toggleInitialPermission('reports.view'))
    expect(result.current.createForm.permisos).not.toContain('reports.view')
  })

  it('submitCreate crea, cierra, limpia y recarga la lista', async () => {
    vi.mocked(createUser).mockResolvedValue({} as never)
    const { result } = await load()
    act(() => result.current.openCreate())
    fillValid(result)
    await act(async () => result.current.submitCreate())
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ correo: 'eva@correo.mx', id_municipio: 1 }))
    expect(result.current.createOpen).toBe(false)
    expect(result.current.createForm.nombre).toBe('')
    await waitFor(() => expect(getUsers).toHaveBeenCalledTimes(2))
  })

  it('si crear falla muestra el error y conserva el formulario', async () => {
    vi.mocked(createUser).mockRejectedValue(new ApiError(409, 'El correo ya existe'))
    const { result } = await load()
    act(() => result.current.openCreate())
    fillValid(result)
    await act(async () => result.current.submitCreate())
    expect(result.current.createError).toBe('El correo ya existe')
    expect(result.current.createOpen).toBe(true)
    expect(result.current.createForm.nombre).toBe('Eva')
    expect(result.current.creating).toBe(false)
  })

  it('un error ajeno a la API usa el mensaje general', async () => {
    vi.mocked(createUser).mockRejectedValue(new TypeError('red'))
    const { result } = await load()
    fillValid(result)
    await act(async () => result.current.submitCreate())
    expect(result.current.createError).toBe('No se pudo registrar al usuario')
  })

  it('no cierra el popup mientras se está registrando', async () => {
    let finish: (value: never) => void = () => undefined
    vi.mocked(createUser).mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { result } = await load()
    act(() => result.current.openCreate())
    fillValid(result)
    let sending: Promise<void> | undefined
    act(() => {
      sending = result.current.submitCreate()
    })
    expect(result.current.creating).toBe(true)
    act(() => result.current.closeCreate())
    expect(result.current.createOpen).toBe(true)
    await act(async () => {
      finish({} as never)
      await sending
    })
  })

  it('si recargar la lista falla después de crear, no rompe', async () => {
    vi.mocked(createUser).mockResolvedValue({} as never)
    const { result } = await load()
    fillValid(result)
    vi.mocked(getUsers).mockRejectedValue(new TypeError('red'))
    await act(async () => result.current.submitCreate())
    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(result.current.users).toHaveLength(2)
  })
})
