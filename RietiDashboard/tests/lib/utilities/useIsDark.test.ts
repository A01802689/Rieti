import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useIsDark from '@/lib/utilities/useIsDark'
import { mockMatchMedia } from '../../helpers/media'

describe('useIsDark', () => {
  it('es false en modo claro', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsDark())
    expect(result.current).toBe(false)
  })

  it('es true en modo oscuro', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsDark())
    expect(result.current).toBe(true)
  })

  it('pregunta por prefers-color-scheme: dark', () => {
    const queries: string[] = []
    const original = window.matchMedia
    window.matchMedia = ((query: string) => {
      queries.push(query)
      return original(query)
    }) as typeof window.matchMedia
    renderHook(() => useIsDark())
    expect(queries).toContain('(prefers-color-scheme: dark)')
  })

  it('se actualiza cuando el sistema cambia', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useIsDark())
    act(() => media.set(true))
    expect(result.current).toBe(true)
    act(() => media.set(false))
    expect(result.current).toBe(false)
  })

  it('quita su escucha al desmontar', () => {
    const media = mockMatchMedia(false)
    const { unmount } = renderHook(() => useIsDark())
    expect(media.listenerCount()).toBeGreaterThan(0)
    unmount()
    expect(media.listenerCount()).toBe(0)
  })
})
