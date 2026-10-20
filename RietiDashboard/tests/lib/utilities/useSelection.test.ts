import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSelection } from '@/lib/utilities/useSelection'

describe('useSelection', () => {
  it('empieza apagada y sin ids', () => {
    const { result } = renderHook(() => useSelection(true, [1, 2, 3]))
    expect(result.current.active).toBe(false)
    expect(result.current.ids).toEqual([])
  })

  it('start enciende el modo', () => {
    const { result } = renderHook(() => useSelection(true, [1]))
    act(() => result.current.start())
    expect(result.current.active).toBe(true)
  })

  it('toggle elige y quita un id', () => {
    const { result } = renderHook(() => useSelection(true, [1, 2, 3]))
    act(() => result.current.toggle(2))
    act(() => result.current.toggle(3))
    expect(result.current.ids).toEqual([2, 3])
    expect(result.current.isSelected(2)).toBe(true)
    expect(result.current.isSelected(1)).toBe(false)
    act(() => result.current.toggle(2))
    expect(result.current.ids).toEqual([3])
  })

  it('no cuenta los ids que ya no están en la lista visible', () => {
    const { result, rerender } = renderHook(({ visible }) => useSelection(true, visible), { initialProps: { visible: [1, 2, 3] } })
    act(() => result.current.toggle(1))
    act(() => result.current.toggle(3))
    rerender({ visible: [3] })
    expect(result.current.ids).toEqual([3])
    expect(result.current.isSelected(1)).toBe(false)
  })

  it('un id que vuelve a la lista vuelve a contar', () => {
    const { result, rerender } = renderHook(({ visible }) => useSelection(true, visible), { initialProps: { visible: [1, 2] } })
    act(() => result.current.toggle(1))
    rerender({ visible: [2] })
    expect(result.current.ids).toEqual([])
    rerender({ visible: [1, 2] })
    expect(result.current.ids).toEqual([1])
  })

  it('clear apaga el modo y olvida los ids', () => {
    const { result } = renderHook(() => useSelection(true, [1, 2]))
    act(() => {
      result.current.start()
      result.current.toggle(1)
    })
    act(() => result.current.clear())
    expect(result.current.active).toBe(false)
    expect(result.current.ids).toEqual([])
  })

  it('el modo termina solo cuando enabled pasa a false', () => {
    const { result, rerender } = renderHook(({ enabled }) => useSelection(enabled, [1, 2]), { initialProps: { enabled: true } })
    act(() => {
      result.current.start()
      result.current.toggle(1)
    })
    expect(result.current.active).toBe(true)
    rerender({ enabled: false })
    expect(result.current.active).toBe(false)
    expect(result.current.ids).toEqual([])
    rerender({ enabled: true })
    expect(result.current.active).toBe(false)
    expect(result.current.ids).toEqual([])
  })

  it('con enabled false start no enciende el modo', () => {
    const { result } = renderHook(() => useSelection(false, [1]))
    act(() => result.current.start())
    expect(result.current.active).toBe(false)
  })

  it('con una lista vacía no hay ids aunque se haya elegido uno', () => {
    const { result } = renderHook(() => useSelection(true, []))
    act(() => result.current.toggle(1))
    expect(result.current.ids).toEqual([])
  })
})
