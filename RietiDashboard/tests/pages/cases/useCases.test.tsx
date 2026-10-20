import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addNote2Case, deleteCases, getCase, getCases, updateCase } from '@/lib/api/cases'
import { ApiError } from '@/lib/api/client'
import { getReports } from '@/lib/api/reports'
import { useCase, useCases } from '@/pages/cases/useCases'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { AuthTestProvider } from '../../helpers/AuthTestProvider'
import { makeCase, makeReport } from '../../helpers/fixtures'

vi.mock('@/lib/api/cases', () => ({
  getCases: vi.fn(),
  getCase: vi.fn(),
  updateCase: vi.fn(),
  addNote2Case: vi.fn(),
  deleteCases: vi.fn(),
}))
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn() }))

beforeEach(() => {
  for (const fn of [getCases, getCase, updateCase, addNote2Case, deleteCases, getReports]) vi.mocked(fn).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const wrapperFor = (user: ReturnType<typeof makeStaff>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AuthTestProvider value={makeAuth(user)}>{children}</AuthTestProvider>
  }

const place = makeCase().ubicacion
const cases = [
  makeCase({ id_caso: 1, estado: 'Abierto', fecha_caso: '2026-03-01T10:00:00', urgencia: 'Alta' }),
  makeCase({ id_caso: 22, estado: 'Cerrado', fecha_caso: '2026-03-05T10:00:00', urgencia: null, ubicacion: { ...place, colonia: 'Árbol', calle: 'Ñandú' } }),
  makeCase({ id_caso: 3, estado: 'En desarrollo', fecha_caso: '2026-03-03T10:00:00', ubicacion: { ...place, colonia: null, calle: null } }),
]

const load = async (user = makeAdmin()) => {
  vi.mocked(getCases).mockResolvedValue(cases)
  const hook = renderHook(() => useCases(), { wrapper: wrapperFor(user) })
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

describe('useCases', () => {
  it('ordena de más nuevo a más viejo', async () => {
    const { result } = await load()
    expect(result.current.cases.map((c) => c.id_caso)).toEqual([22, 3, 1])
  })

  it('cuenta los casos por estado, con todos los estados aunque no tengan casos', async () => {
    const { result } = await load()
    expect(result.current.filterOptions).toEqual([
      { value: 'Todos', total: 3 },
      { value: 'Abierto', total: 1 },
      { value: 'En desarrollo', total: 1 },
      { value: 'Cerrado', total: 1 },
    ])
  })

  it('filtra por estado', async () => {
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Cerrado'))
    expect(result.current.cases.map((c) => c.id_caso)).toEqual([22])
  })

  it('busca por id, urgencia, calle, colonia y municipio sin acentos', async () => {
    const { result } = await load()
    const ids = () => result.current.cases.map((c) => c.id_caso)
    act(() => result.current.setSearch('22'))
    expect(ids()).toEqual([22])
    act(() => result.current.setSearch('alta'))
    expect(ids()).toEqual([3, 1])
    act(() => result.current.setSearch('ARBOL'))
    expect(ids()).toEqual([22])
    act(() => result.current.setSearch('nandu'))
    expect(ids()).toEqual([22])
    act(() => result.current.setSearch('atizapan'))
    expect(ids()).toHaveLength(3)
    act(() => result.current.setSearch('zzz'))
    expect(ids()).toEqual([])
  })

  it('un id parcial coincide con cualquier id que lo contenga', async () => {
    const { result } = await load()
    act(() => result.current.setSearch('2'))
    expect(result.current.cases.map((c) => c.id_caso)).toContain(22)
  })

  it('un caso sin urgencia ni colonia no rompe la búsqueda', async () => {
    const { result } = await load()
    act(() => result.current.setSearch('centro'))
    expect(result.current.cases.map((c) => c.id_caso)).toEqual([1])
  })

  it('un 403 marca forbidden y un fallo marca loadFailed', async () => {
    vi.mocked(getCases).mockRejectedValueOnce(new ApiError(403, 'x'))
    const denied = renderHook(() => useCases(), { wrapper: wrapperFor(makeStaff()) })
    await waitFor(() => expect(denied.result.current.loading).toBe(false))
    expect(denied.result.current).toMatchObject({ forbidden: true, loadFailed: false })
    vi.mocked(getCases).mockRejectedValueOnce(new TypeError('red'))
    const failed = renderHook(() => useCases(), { wrapper: wrapperFor(makeStaff()) })
    await waitFor(() => expect(failed.result.current.loading).toBe(false))
    expect(failed.result.current).toMatchObject({ forbidden: false, loadFailed: true })
  })

  it('reload se recupera de un fallo', async () => {
    vi.mocked(getCases).mockRejectedValueOnce(new TypeError('red')).mockResolvedValueOnce(cases)
    const { result } = renderHook(() => useCases(), { wrapper: wrapperFor(makeAdmin()) })
    await waitFor(() => expect(result.current.loadFailed).toBe(true))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.cases).toHaveLength(3))
    expect(result.current.loadFailed).toBe(false)
  })

  it('solo un administrador viendo Cerrado puede seleccionar', async () => {
    const admin = await load(makeAdmin())
    act(() => admin.result.current.setSelectedFilter('Cerrado'))
    expect(admin.result.current.canSelect).toBe(true)
    const staff = await load(makeStaff('cases.view'))
    act(() => staff.result.current.setSelectedFilter('Cerrado'))
    expect(staff.result.current.canSelect).toBe(false)
  })

  it('removeSelected borra, limpia y recarga', async () => {
    vi.mocked(deleteCases).mockResolvedValue({ eliminados: [22], omitidos: [] })
    const { result } = await load()
    act(() => result.current.setSelectedFilter('Cerrado'))
    act(() => {
      result.current.selection.start()
      result.current.selection.toggle(22)
    })
    await act(async () => void (await result.current.removeSelected()))
    expect(deleteCases).toHaveBeenCalledWith([22])
    await waitFor(() => expect(getCases).toHaveBeenCalledTimes(2))
    expect(result.current.selection.active).toBe(false)
  })
})

describe('useCase', () => {
  const setup = async () => {
    vi.mocked(getCase).mockResolvedValue(makeCase({ id_caso: 3 }))
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    const hook = renderHook(() => useCase(3))
    await waitFor(() => expect(hook.result.current.loading).toBe(false))
    return hook
  }

  it('carga el caso con sus reportes', async () => {
    const { result } = await setup()
    expect(result.current.caseF?.id_caso).toBe(3)
    expect(result.current.reports).toHaveLength(1)
    expect(getReports).toHaveBeenCalledWith(3)
  })

  it('sin datos los reportes son una lista vacía', () => {
    const { result } = renderHook(() => useCase(Number('abc')))
    expect(result.current.caseF).toBeUndefined()
    expect(result.current.reports).toEqual([])
  })

  it('saveChanges con cambios y nota hace PATCH, luego la nota y recarga una vez', async () => {
    vi.mocked(updateCase).mockResolvedValue(makeCase())
    vi.mocked(addNote2Case).mockResolvedValue({ folio: 'x', fecha: 'x', tipo: 'Nota', autor: 'a', nota: 'n' })
    const { result } = await setup()
    await act(async () => result.current.saveChanges({ patch: { estado: 'Cerrado' }, nota: 'Listo' }))
    expect(updateCase).toHaveBeenCalledWith(3, { estado: 'Cerrado' })
    expect(addNote2Case).toHaveBeenCalledWith(3, 'Listo')
    await waitFor(() => expect(getCase).toHaveBeenCalledTimes(2))
  })

  it('con solo la nota no llama al PATCH', async () => {
    vi.mocked(addNote2Case).mockResolvedValue({} as never)
    const { result } = await setup()
    await act(async () => result.current.saveChanges({ patch: {}, nota: 'Solo nota' }))
    expect(updateCase).not.toHaveBeenCalled()
    expect(addNote2Case).toHaveBeenCalledWith(3, 'Solo nota')
  })

  it('una nota vacía "" sí se envía porque solo null cuenta como sin nota', async () => {
    vi.mocked(addNote2Case).mockResolvedValue({} as never)
    const { result } = await setup()
    await act(async () => result.current.saveChanges({ patch: {}, nota: '' }))
    expect(addNote2Case).toHaveBeenCalledWith(3, '')
  })

  it('sin cambios ni nota no llama a nada pero recarga', async () => {
    const { result } = await setup()
    await act(async () => result.current.saveChanges({ patch: {}, nota: null }))
    expect(updateCase).not.toHaveBeenCalled()
    expect(addNote2Case).not.toHaveBeenCalled()
    await waitFor(() => expect(getCase).toHaveBeenCalledTimes(2))
  })

  it('si falla el PATCH lo dice y no intenta la nota', async () => {
    vi.mocked(updateCase).mockRejectedValue(new ApiError(422, 'lat y lng juntos'))
    const { result } = await setup()
    await act(async () => {
      await expect(result.current.saveChanges({ patch: { estado: 'Cerrado' }, nota: 'x' })).rejects.toThrow(
        'No se pudieron guardar los datos: lat y lng juntos',
      )
    })
    expect(addNote2Case).not.toHaveBeenCalled()
  })

  it('si falla la nota después del PATCH dice que los datos sí se guardaron', async () => {
    vi.mocked(updateCase).mockResolvedValue(makeCase())
    vi.mocked(addNote2Case).mockRejectedValue(new ApiError(422, 'vacía'))
    const { result } = await setup()
    await act(async () => {
      await expect(result.current.saveChanges({ patch: { estado: 'Cerrado' }, nota: 'x' })).rejects.toThrow(
        'Los datos se guardaron, pero no se pudo agregar la nota: vacía',
      )
    })
  })

  it('si falla la nota sola, no dice que se guardaron datos', async () => {
    vi.mocked(addNote2Case).mockRejectedValue('texto')
    const { result } = await setup()
    await act(async () => {
      await expect(result.current.saveChanges({ patch: {}, nota: 'x' })).rejects.toThrow('No se pudo agregar la nota: error desconocido')
    })
  })

  it('update aplica un cambio y recarga', async () => {
    vi.mocked(updateCase).mockResolvedValue(makeCase())
    const { result } = await setup()
    await act(async () => result.current.update({ urgencia: 'Baja' }))
    expect(updateCase).toHaveBeenCalledWith(3, { urgencia: 'Baja' })
    await waitFor(() => expect(getCase).toHaveBeenCalledTimes(2))
  })

  it('update relanza el error y recarga igual', async () => {
    vi.mocked(updateCase).mockRejectedValue(new ApiError(403, 'x'))
    const { result } = await setup()
    await act(async () => {
      await expect(result.current.update({ urgencia: 'Baja' })).rejects.toMatchObject({ status: 403 })
    })
    await waitFor(() => expect(getCase).toHaveBeenCalledTimes(2))
  })
})
