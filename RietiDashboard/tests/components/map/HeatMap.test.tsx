import { act, render, screen, waitFor } from '@testing-library/react'
import { createElement, forwardRef, useImperativeHandle, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HeatMap from '@/components/ui/HeatMap'
import { ApiError } from '@/lib/api/client'
import { getReports } from '@/lib/api/reports'
import { makeCase, makeReport } from '../../helpers/fixtures'

const fitBounds = vi.fn()

/** Props the last rendered map received, so the test can call its handlers */
const mapProps: { current: Record<string, unknown> } = { current: {} }
const layers: string[] = []

vi.mock('react-map-gl/maplibre', () => {
  const Map = forwardRef(function MapMock(props: Record<string, unknown> & { children?: ReactNode }, ref) {
    mapProps.current = props
    useImperativeHandle(ref, () => ({ fitBounds }))
    return createElement('div', { 'data-testid': 'map', style: { cursor: String(props.cursor) } }, props.children)
  })
  return {
    default: Map,
    Source: ({ id, children }: { id: string; children?: ReactNode }) => {
      layers.push(id)
      return createElement('div', { 'data-testid': `source-${id}` }, children)
    },
    Layer: () => null,
  }
})
vi.mock('@/lib/api/reports', () => ({ getReports: vi.fn() }))

beforeEach(() => {
  fitBounds.mockClear()
  layers.length = 0
  vi.mocked(getReports).mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

const click = (features?: unknown[]) => {
  const flyTo = vi.fn()
  const handler = mapProps.current.onClick as (e: unknown) => void
  act(() => handler({ features, target: { flyTo, getZoom: () => 10 } }))
  return flyTo
}

describe('HeatMap con datos recibidos', () => {
  it('dibuja la densidad y las dos capas de puntos', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[makeCase()]} />)
    expect(screen.getByTestId('source-calor')).toBeInTheDocument()
    expect(screen.getByTestId('source-reportes')).toBeInTheDocument()
    expect(screen.getByTestId('source-casos')).toBeInTheDocument()
    expect(mapProps.current.interactiveLayerIds).toEqual(['reportes', 'casos'])
  })

  it('no pide datos a la API cuando recibe los arreglos', () => {
    render(<HeatMap reportsArr={[]} casesArr={[]} />)
    expect(getReports).not.toHaveBeenCalled()
  })

  it('showReports false oculta esa capa y no la deja hacer clic', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[makeCase()]} showReports={false} />)
    expect(screen.queryByTestId('source-reportes')).not.toBeInTheDocument()
    expect(mapProps.current.interactiveLayerIds).toEqual(['casos'])
  })

  it('con las dos capas apagadas no hay densidad ni leyenda', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[makeCase()]} showReports={false} showCases={false} />)
    expect(screen.queryByTestId('source-calor')).not.toBeInTheDocument()
    expect(screen.queryByText(/Mapa de calor:/)).not.toBeInTheDocument()
  })

  it('saltarse los puntos con coordenadas inválidas', () => {
    const base = makeReport().ubicacion
    render(<HeatMap reportsArr={[makeReport({ ubicacion: { ...base, lat: 500 } })]} casesArr={[]} />)
    expect(screen.getByTestId('source-reportes')).toBeInTheDocument()
    expect(screen.queryByTestId('source-calor')).not.toBeInTheDocument()
  })

  it('showLegend false oculta la leyenda y la clase de posición se aplica', () => {
    const { container, rerender } = render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} legendClassName="bottom-20 left-4" />)
    expect(screen.getByText('Reportes: Nivel de riesgo')).toBeInTheDocument()
    expect(container.querySelector('.bottom-20')).not.toBeNull()
    rerender(<HeatMap reportsArr={[makeReport()]} casesArr={[]} showLegend={false} />)
    expect(screen.queryByText('Reportes: Nivel de riesgo')).not.toBeInTheDocument()
  })

  it('centra el mapa una sola vez cuando carga', () => {
    const { rerender } = render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} />)
    expect(fitBounds).not.toHaveBeenCalled()
    act(() => (mapProps.current.onLoad as () => void)())
    expect(fitBounds).toHaveBeenCalledTimes(1)
    expect(fitBounds.mock.calls[0][1]).toMatchObject({ maxZoom: 15, duration: 0 })
    rerender(<HeatMap reportsArr={[makeReport(), makeReport({ id_reporte: 2 })]} casesArr={[]} />)
    expect(fitBounds).toHaveBeenCalledTimes(1)
  })

  it('sin puntos no centra', () => {
    render(<HeatMap reportsArr={[]} casesArr={[]} />)
    act(() => (mapProps.current.onLoad as () => void)())
    expect(fitBounds).not.toHaveBeenCalled()
  })

  it('el cursor cambia al pasar sobre un punto', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} />)
    expect(screen.getByTestId('map').style.cursor).toBe('grab')
    act(() => (mapProps.current.onMouseEnter as () => void)())
    expect(screen.getByTestId('map').style.cursor).toBe('pointer')
    act(() => (mapProps.current.onMouseLeave as () => void)())
    expect(screen.getByTestId('map').style.cursor).toBe('grab')
  })
})

describe('HeatMap: clic', () => {
  it('un clic en un reporte lo selecciona y vuela a él sin alejar el zoom', () => {
    const setSelected = vi.fn()
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} setSelected={setSelected} />)
    const flyTo = click([{ properties: { id: 7 }, layer: { id: 'reportes' }, geometry: { type: 'Point', coordinates: [-99.2, 19.5] } }])
    expect(setSelected).toHaveBeenCalledWith({ type: 'report', id: '7' })
    expect(flyTo).toHaveBeenCalledWith({ center: [-99.2, 19.5], zoom: 14, duration: 600 })
  })

  it('un clic en un caso lo selecciona como caso', () => {
    const setSelected = vi.fn()
    render(<HeatMap reportsArr={[]} casesArr={[makeCase()]} setSelected={setSelected} />)
    click([{ properties: { id: '3' }, layer: { id: 'casos' }, geometry: { type: 'Point', coordinates: [0, 0] } }])
    expect(setSelected).toHaveBeenCalledWith({ type: 'case', id: '3' })
  })

  it('el zoom actual mayor a 14 se conserva', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} setSelected={vi.fn()} />)
    const flyTo = vi.fn()
    const handler = mapProps.current.onClick as (e: unknown) => void
    act(() => handler({ features: [{ properties: { id: 1 }, layer: { id: 'reportes' }, geometry: { type: 'Point', coordinates: [1, 2] } }], target: { flyTo, getZoom: () => 17 } }))
    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ zoom: 17 }))
  })

  it('un clic en el mapa vacío limpia la selección', () => {
    const setSelected = vi.fn()
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} setSelected={setSelected} />)
    click(undefined)
    click([])
    expect(setSelected).toHaveBeenNthCalledWith(1, null)
    expect(setSelected).toHaveBeenNthCalledWith(2, null)
  })

  it('un punto sin id no selecciona nada', () => {
    const setSelected = vi.fn()
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} setSelected={setSelected} />)
    const flyTo = click([{ properties: {}, layer: { id: 'reportes' }, geometry: { type: 'Point', coordinates: [0, 0] } }])
    expect(setSelected).not.toHaveBeenCalled()
    expect(flyTo).not.toHaveBeenCalled()
  })

  it('una geometría que no es punto selecciona pero no vuela', () => {
    const setSelected = vi.fn()
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} setSelected={setSelected} />)
    const flyTo = click([{ properties: { id: 1 }, layer: { id: 'reportes' }, geometry: { type: 'Polygon', coordinates: [] } }])
    expect(setSelected).toHaveBeenCalled()
    expect(flyTo).not.toHaveBeenCalled()
  })

  it('sin setSelected un clic no falla', () => {
    render(<HeatMap reportsArr={[makeReport()]} casesArr={[]} />)
    expect(() => click(undefined)).not.toThrow()
  })
})

describe('HeatMap en vista previa (sin arreglos)', () => {
  it('pide sus propios reportes y los dibuja', async () => {
    vi.mocked(getReports).mockResolvedValue([makeReport()])
    render(<HeatMap />)
    await waitFor(() => expect(screen.getByTestId('source-reportes')).toBeInTheDocument())
    expect(screen.queryByTestId('source-casos')).not.toBeInTheDocument()
  })

  it('un 403 muestra la tarjeta de sin permiso', async () => {
    vi.mocked(getReports).mockRejectedValue(new ApiError(403, 'x'))
    render(<HeatMap />)
    expect(await screen.findByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })

  it('otro fallo deja el mapa sin puntos', async () => {
    vi.mocked(getReports).mockRejectedValue(new TypeError('red'))
    render(<HeatMap />)
    await waitFor(() => expect(console.error).toHaveBeenCalled())
    expect(screen.getByTestId('map')).toBeInTheDocument()
    expect(screen.queryByTestId('source-calor')).not.toBeInTheDocument()
  })
})
