import { screen, waitFor } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCases } from '@/lib/api/cases'
import { getReports } from '@/lib/api/reports'
import type { Selected } from '@/lib/types/Selected'
import HeatMapPage from '@/pages/map/HeatMapPage'
import { makeAdmin, makeAuth } from '../../helpers/auth'
import { makeCase, makeReport } from '../../helpers/fixtures'
import { renderApp } from '../../helpers/render'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn() }))
vi.mock('@/components/ui/HeatMap', () => ({
  default: ({ setSelected, showReports, showCases }: { setSelected: Dispatch<SetStateAction<Selected | null>>; showReports: boolean; showCases: boolean }) => (
    <div>
      <button onClick={() => setSelected({ type: 'report', id: '1' })}>elegir reporte</button>
      <button onClick={() => setSelected({ type: 'case', id: '3' })}>elegir caso</button>
      <span data-testid="layers">{`${showReports}-${showCases}`}</span>
    </div>
  ),
}))

beforeEach(() => {
  vi.mocked(getReports).mockResolvedValue([makeReport()])
  vi.mocked(getCases).mockResolvedValue([makeCase()])
})

describe('HeatMapPage: tarjeta de selección', () => {
  it('seleccionar un reporte muestra su tarjeta y cerrarla la quita', async () => {
    const view = renderApp(<HeatMapPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'elegir reporte' }))
    expect(await screen.findByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('heading', { name: 'REP-2026-0001' })).not.toBeInTheDocument()
  })

  it('apagar la capa de la tarjeta la oculta', async () => {
    const view = renderApp(<HeatMapPage />, { auth: makeAuth(makeAdmin()) })
    await view.user.click(await screen.findByRole('button', { name: 'elegir caso' }))
    expect(await screen.findByRole('heading', { name: 'Caso #3' })).toBeInTheDocument()
    await view.user.click(screen.getByRole('checkbox', { name: 'Casos' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Caso #3' })).not.toBeInTheDocument())
    expect(screen.getByTestId('layers')).toHaveTextContent('true-false')
  })
})
