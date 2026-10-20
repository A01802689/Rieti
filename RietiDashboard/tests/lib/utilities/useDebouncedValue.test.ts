import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from '@/lib/utilities/useDebouncedValue'

beforeEach(() => {
  vi.useFakeTimers()
})

describe('useDebouncedValue', () => {
  it('devuelve el primer valor de inmediato', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))
    expect(result.current).toBe('a')
  })

  it('sigue al valor solo después de la espera', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    act(() => void vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')
    act(() => void vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('cada cambio reinicia la espera y solo llega el último valor', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    act(() => void vi.advanceTimersByTime(200))
    rerender({ value: 'c' })
    act(() => void vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
    act(() => void vi.advanceTimersByTime(100))
    expect(result.current).toBe('c')
  })

  it('con espera 0 sigue al valor en el siguiente ciclo', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 0), { initialProps: { value: 1 } })
    rerender({ value: 2 })
    act(() => void vi.advanceTimersByTime(0))
    expect(result.current).toBe(2)
  })

  it('si el valor vuelve al anterior antes de la espera, no cambia', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    rerender({ value: 'a' })
    act(() => void vi.advanceTimersByTime(1000))
    expect(result.current).toBe('a')
  })

  it('limpia el temporizador al desmontar', () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
