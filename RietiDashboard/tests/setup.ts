import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { mockMatchMedia } from './helpers/media'

// jsdom has no WebGL: the maps are replaced by plain elements that show what they receive
vi.mock('react-map-gl/maplibre', () => ({
  default: ({ children, initialViewState }: { children?: ReactNode; initialViewState?: unknown }) =>
    createElement('div', { 'data-testid': 'map', 'data-view': JSON.stringify(initialViewState) }, children),
  Marker: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
    createElement('span', { 'data-testid': 'marker' }, `${latitude},${longitude}`),
  Source: ({ children }: { children?: ReactNode }) => createElement('div', null, children),
  Layer: () => null,
  NavigationControl: () => null,
}))
vi.mock('maplibre-gl', () => ({ setWorkerUrl: vi.fn(), default: {} }))
vi.mock('@/lib/map/worker', () => ({}))

vi.stubEnv('VITE_API_URL', 'http://api.test')

beforeEach(() => {
  // jsdom has no matchMedia; by default the system is in light mode
  mockMatchMedia(false)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})
