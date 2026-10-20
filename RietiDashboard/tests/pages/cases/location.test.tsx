import { act, screen, waitFor } from '@testing-library/react'
import { createElement, forwardRef, useImperativeHandle, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces, type GeocodedPlace } from '@/lib/api/geocoding'
import { CaseLocationCard } from '@/pages/cases/components/CaseLocationCard'
import { CaseLocationForm } from '@/pages/cases/components/CaseLocationForm'
import { LocationPicker } from '@/pages/cases/components/LocationPicker'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { makeCase } from '../../helpers/fixtures'
import { renderApp } from '../../helpers/render'

const flyTo = vi.fn()
const mapProps: { current: Record<string, unknown> } = { current: {} }
const markerProps: { current: Record<string, unknown> | null } = { current: null }

vi.mock('react-map-gl/maplibre', () => ({
  default: forwardRef(function MapMock(props: Record<string, unknown> & { children?: ReactNode }, ref) {
    mapProps.current = props
    useImperativeHandle(ref, () => ({ flyTo }))
    return createElement('div', { 'data-testid': 'map' }, props.children)
  }),
  Marker: (props: Record<string, unknown>) => {
    markerProps.current = props
    return createElement('span', { 'data-testid': 'marker' })
  },
  NavigationControl: () => null,
}))
vi.mock('@/lib/api/geocoding', () => ({ searchPlaces: vi.fn() }))

beforeEach(() => {
  flyTo.mockClear()
  markerProps.current = null
  vi.mocked(searchPlaces).mockReset()
})

/** Position the way MapLibre gives it: it has a wrap method */
const lngLat = (lng: number, lat: number) => ({ wrap: () => ({ lng, lat }) })

const place = (overrides: Partial<GeocodedPlace> = {}): GeocodedPlace => ({
  id: 1,
  label: 'Calle Uno, Centro',
  lat: 19.6,
  lng: -99.3,
  colonia: 'Centro',
  calle: 'Calle Uno',
  ...overrides,
})

describe('LocationPicker', () => {
  const renderPicker = (point: { lat: number; lng: number } | null = null) => {
    const onPointChange = vi.fn()
    const onPlaceChosen = vi.fn()
    const view = renderApp(<LocationPicker point={point} onPointChange={onPointChange} onPlaceChosen={onPlaceChosen} />)
    return { ...view, onPointChange, onPlaceChosen }
  }

  it('sin punto empieza en el área de Atizapán y pide colocar el marcador', () => {
    renderPicker()
    expect(mapProps.current.initialViewState).toMatchObject({ bounds: [-99.32, 19.52, -99.19, 19.63] })
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
    expect(screen.getByText('Haz clic en el mapa para colocar el marcador')).toBeInTheDocument()
  })

  it('con punto empieza ahí, dibuja el marcador y escribe sus coordenadas', () => {
    renderPicker({ lat: 19.5, lng: -99.2 })
    expect(mapProps.current.initialViewState).toMatchObject({ latitude: 19.5, longitude: -99.2, zoom: 16 })
    expect(screen.getByTestId('marker')).toBeInTheDocument()
    expect(screen.getByText(/Marcador en 19.50000, -99.20000/)).toBeInTheDocument()
  })

  it('un clic en el mapa redondea a 6 decimales', () => {
    const view = renderPicker()
    act(() => (mapProps.current.onClick as (e: unknown) => void)({ lngLat: lngLat(-99.12345678, 19.98765432) }))
    expect(view.onPointChange).toHaveBeenCalledWith({ lat: 19.987654, lng: -99.123457 })
  })

  it('soltar el marcador arrastrado manda el punto nuevo', () => {
    const view = renderPicker({ lat: 1, lng: 2 })
    act(() => (markerProps.current!.onDragEnd as (e: unknown) => void)({ lngLat: lngLat(-99.5, 19.5) }))
    expect(view.onPointChange).toHaveBeenCalledWith({ lat: 19.5, lng: -99.5 })
  })

  it('un clic sobre el marcador no se propaga al mapa', () => {
    renderPicker({ lat: 1, lng: 2 })
    const stopPropagation = vi.fn()
    ;(markerProps.current!.onClick as (e: unknown) => void)({ originalEvent: { stopPropagation } })
    expect(stopPropagation).toHaveBeenCalled()
  })

  it('el botón Buscar está deshabilitado sin texto', () => {
    renderPicker()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()
  })

  it('busca con el botón y lista los resultados; elegir uno vuela, avisa y limpia la lista', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([place()])
    const view = renderPicker()
    await view.user.type(screen.getByRole('searchbox', { name: 'Buscar un lugar' }), 'calle uno')
    await view.user.click(screen.getByRole('button', { name: 'Buscar' }))
    await view.user.click(await screen.findByRole('button', { name: 'Calle Uno, Centro' }))
    expect(flyTo).toHaveBeenCalledWith({ center: [-99.3, 19.6], zoom: 16, duration: 600 })
    expect(view.onPlaceChosen).toHaveBeenCalledWith(place())
    expect(screen.queryByRole('list', { name: 'Resultados de la búsqueda' })).not.toBeInTheDocument()
  })

  it('Enter también busca', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([place()])
    const view = renderPicker()
    await view.user.type(screen.getByRole('searchbox'), 'calle{Enter}')
    expect(await screen.findByRole('list', { name: 'Resultados de la búsqueda' })).toBeInTheDocument()
  })

  it('sin resultados lo dice', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([])
    const view = renderPicker()
    await view.user.type(screen.getByRole('searchbox'), 'nada{Enter}')
    expect(await screen.findByRole('status')).toHaveTextContent('No se encontraron lugares')
  })

  it('si la búsqueda falla muestra el error', async () => {
    vi.mocked(searchPlaces).mockRejectedValue(new Error('Hay demasiadas búsquedas seguidas'))
    const view = renderPicker()
    await view.user.type(screen.getByRole('searchbox'), 'x{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('demasiadas búsquedas')
  })
})

describe('CaseLocationForm', () => {
  const renderForm = (caso = makeCase(), props: { busy?: boolean; error?: string } = {}) => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    const view = renderApp(<CaseLocationForm caso={caso} busy={props.busy ?? false} error={props.error ?? ''} onSave={onSave} onCancel={onCancel} />)
    return { ...view, onSave, onCancel }
  }

  const empty = () => {
    const base = makeCase().ubicacion
    return makeCase({ ubicacion: { ...base, colonia: null, calle: null, lat: null, lng: null } })
  }

  it('empieza con los datos del caso y Guardar deshabilitado', () => {
    renderForm()
    expect(screen.getByLabelText('Colonia')).toHaveValue('Centro')
    expect(screen.getByLabelText('Calle')).toHaveValue('Calle 1')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('un caso sin ubicación empieza vacío y sin marcador', () => {
    renderForm(empty())
    expect(screen.getByLabelText('Colonia')).toHaveValue('')
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  it('al editar la colonia se habilita Guardar y se manda la ubicación completa recortada', async () => {
    const view = renderForm()
    await view.user.clear(screen.getByLabelText('Colonia'))
    await view.user.type(screen.getByLabelText('Colonia'), '  Nueva  ')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.onSave).toHaveBeenCalledWith({ colonia: 'Nueva', calle: 'Calle 1', lat: 19.57, lng: -99.25 })
  })

  it('solo espacios en un campo hace que no se mande ese campo', async () => {
    const view = renderForm(empty())
    await view.user.type(screen.getByLabelText('Colonia'), '   ')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    await view.user.type(screen.getByLabelText('Calle'), 'Calle 9')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.onSave).toHaveBeenCalledWith({ calle: 'Calle 9' })
  })

  it('un clic en el mapa coloca el marcador y habilita Guardar', async () => {
    const view = renderForm(empty())
    act(() => (mapProps.current.onClick as (e: unknown) => void)({ lngLat: lngLat(-99.2, 19.5) }))
    expect(await screen.findByTestId('marker')).toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.onSave).toHaveBeenCalledWith({ lat: 19.5, lng: -99.2 })
  })

  it('elegir un resultado rellena colonia y calle de su dirección, y deja lo escrito si falta', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([place({ colonia: '', calle: 'Calle Nueva' })])
    const view = renderForm()
    await view.user.type(screen.getByRole('searchbox'), 'x{Enter}')
    await view.user.click(await screen.findByRole('button', { name: 'Calle Uno, Centro' }))
    expect(screen.getByLabelText('Colonia')).toHaveValue('Centro')
    expect(screen.getByLabelText('Calle')).toHaveValue('Calle Nueva')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.onSave).toHaveBeenCalledWith({ colonia: 'Centro', calle: 'Calle Nueva', lat: 19.6, lng: -99.3 })
  })

  it('recorta a 100 caracteres la colonia de un resultado', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([place({ colonia: 'c'.repeat(150) })])
    const view = renderForm()
    await view.user.type(screen.getByRole('searchbox'), 'x{Enter}')
    await view.user.click(await screen.findByRole('button', { name: 'Calle Uno, Centro' }))
    expect(screen.getByLabelText('Colonia')).toHaveValue('c'.repeat(100))
  })

  it('ocupado muestra Guardando y bloquea los botones; el error se muestra', () => {
    renderForm(makeCase(), { busy: true, error: 'No se pudo' })
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo')
  })

  it('Cancelar llama a onCancel', async () => {
    const view = renderForm()
    await view.user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(view.onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('CaseLocationCard', () => {
  const renderCard = (auth: ReturnType<typeof makeAuth>, caso = makeCase(), update = vi.fn().mockResolvedValue(undefined)) => {
    const view = renderApp(<CaseLocationCard caso={caso} update={update} />, { auth })
    return { ...view, update }
  }

  it('sin cases.edit no hay botón', () => {
    renderCard(makeAuth(makeStaff('cases.view')))
    expect(screen.queryByRole('button', { name: /ubicación/ })).not.toBeInTheDocument()
  })

  it('con ubicación el botón dice Editar ubicación', () => {
    renderCard(makeAuth(makeAdmin()))
    expect(screen.getByRole('button', { name: 'Editar ubicación' })).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('un caso sin colonia, calle ni coordenadas dice Agregar ubicación y muestra la tarjeta de no disponible', () => {
    const base = makeCase().ubicacion
    renderCard(makeAuth(makeAdmin()), makeCase({ ubicacion: { ...base, colonia: null, calle: null, lat: null, lng: null } }))
    expect(screen.getByRole('button', { name: 'Agregar ubicación' })).toBeInTheDocument()
    expect(screen.getByText('Ubicación no disponible')).toBeInTheDocument()
    expect(screen.getAllByText('Sin dato')).toHaveLength(2)
  })

  it('con solo colonia ya cuenta como ubicación', () => {
    const base = makeCase().ubicacion
    renderCard(makeAuth(makeAdmin()), makeCase({ ubicacion: { ...base, calle: null, lat: null, lng: null } }))
    expect(screen.getByRole('button', { name: 'Editar ubicación' })).toBeInTheDocument()
  })

  it('abre el selector, guarda con update y lo cierra', async () => {
    const view = renderCard(makeAuth(makeAdmin()))
    await view.user.click(screen.getByRole('button', { name: 'Editar ubicación' }))
    await view.user.clear(await screen.findByLabelText('Colonia'))
    await view.user.type(screen.getByLabelText('Colonia'), 'Otra')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(view.update).toHaveBeenCalledWith({ ubicacion: { colonia: 'Otra', calle: 'Calle 1', lat: 19.57, lng: -99.25 } }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('si update falla muestra el error y deja abierto el selector', async () => {
    const update = vi.fn().mockRejectedValue(new Error('lat y lng deben ir juntos'))
    const view = renderCard(makeAuth(makeAdmin()), makeCase(), update)
    await view.user.click(screen.getByRole('button', { name: 'Editar ubicación' }))
    await view.user.type(await screen.findByLabelText('Colonia'), 'x')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('lat y lng deben ir juntos')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('Cancelar cierra el selector sin guardar', async () => {
    const view = renderCard(makeAuth(makeAdmin()))
    await view.user.click(screen.getByRole('button', { name: 'Editar ubicación' }))
    await view.user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(view.update).not.toHaveBeenCalled()
  })
})
