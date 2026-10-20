import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ColorLegend } from '@/components/ui/ColorLegend'
import { DragableMenu } from '@/pages/map/components/DragableMenu'
import { DropdownSelect } from '@/pages/map/components/DropdownSelect'
import { Filters } from '@/pages/map/components/Filters'
import { SelectionCard } from '@/pages/map/components/SelectionCard'
import { SliderControlled } from '@/pages/map/components/SliderControlled'
import type { HeatMapState } from '@/pages/map/useHeatMap'
import {
  AGE_RANGE,
  CASE_VISUAL_OPTIONS,
  DAYS_RANGE,
  HOUR_RANGE,
  REPORT_VISUAL_OPTIONS,
  WORK_TYPE_OPTIONS,
} from '@/pages/map/useHeatMap'
import { mockMatchMedia } from '../../helpers/media'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { makeCase, makeReport } from '../../helpers/fixtures'
import { renderApp } from '../../helpers/render'

describe('ColorLegend', () => {
  it('no dibuja nada si ninguna capa está activa', () => {
    const { container } = render(<ColorLegend showReports={false} showCases={false} reportVisual="risk" caseVisual="urgency" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('con las dos capas muestra tres escalas', () => {
    render(<ColorLegend showReports showCases reportVisual="risk" caseVisual="urgency" />)
    expect(screen.getByText('Mapa de calor: Concentración')).toBeInTheDocument()
    expect(screen.getByText('Reportes: Nivel de riesgo')).toBeInTheDocument()
    expect(screen.getByText('Casos: Urgencia')).toBeInTheDocument()
  })

  it('solo reportes oculta la escala de casos, y viceversa', () => {
    const { rerender } = render(<ColorLegend showReports showCases={false} reportVisual="nna" caseVisual="urgency" />)
    expect(screen.queryByText(/Casos:/)).not.toBeInTheDocument()
    rerender(<ColorLegend showReports={false} showCases reportVisual="nna" caseVisual="daysElapsed" />)
    expect(screen.queryByText(/Reportes:/)).not.toBeInTheDocument()
    expect(screen.getByText('Casos: Días transcurridos')).toBeInTheDocument()
  })
})

describe('SliderControlled', () => {
  it('muestra el título, la nota y el rango actual', () => {
    render(<SliderControlled text="Días" note="(solo reportes)" value={[2, 30]} range={DAYS_RANGE} setValue={vi.fn()} />)
    expect(screen.getByText('Días')).toBeInTheDocument()
    expect(screen.getByText('(solo reportes)')).toBeInTheDocument()
    expect(screen.getByText('2 - 30')).toBeInTheDocument()
    expect(screen.getByRole('group')).toHaveAttribute('data-slot', 'slider')
  })

  it('deshabilitado atenúa el título', () => {
    render(<SliderControlled text="Días" value={[0, 365]} range={DAYS_RANGE} setValue={vi.fn()} disabled />)
    expect(screen.getByText('Días').parentElement).toHaveClass('opacity-50')
  })
})

describe('DropdownSelect', () => {
  it('elige por id y vuelve a undefined con "Seleccionar"', async () => {
    const setOption = vi.fn()
    render(<DropdownSelect options={REPORT_VISUAL_OPTIONS} option={REPORT_VISUAL_OPTIONS[0]} setOption={setOption} label="Colorear:" />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('1')
    await userEvent.selectOptions(select, 'Edad aproximada')
    expect(setOption).toHaveBeenLastCalledWith(REPORT_VISUAL_OPTIONS[2])
    await userEvent.selectOptions(select, 'Seleccionar')
    expect(setOption).toHaveBeenLastCalledWith(undefined)
  })

  it('sin opción actual muestra "Seleccionar"', () => {
    render(<DropdownSelect options={CASE_VISUAL_OPTIONS} setOption={vi.fn()} label="x" />)
    expect(screen.getByRole('combobox')).toHaveValue('')
  })
})

describe('SelectionCard', () => {
  const renderCard = (props: Partial<React.ComponentProps<typeof SelectionCard>>, user = makeAdmin()) => {
    const onClose = vi.fn()
    const view = renderApp(<SelectionCard selected={null} onClose={onClose} {...props} />, { auth: makeAuth(user) })
    return { ...view, onClose }
  }

  it('sin selección no dibuja nada', () => {
    const { container } = renderCard({ selected: null })
    expect(container.querySelector('h2')).toBeNull()
  })

  it('un id que no existe en la lista no dibuja nada', () => {
    renderCard({ selected: { type: 'report', id: '99' }, reports: [makeReport()] })
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    renderCard({ selected: { type: 'case', id: '99' }, cases: [makeCase()] })
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('muestra el resumen de un reporte', () => {
    renderCard({ selected: { type: 'report', id: '1' }, reports: [makeReport()] })
    expect(screen.getByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    expect(screen.getByText('Venta ambulante')).toBeInTheDocument()
    expect(screen.getByText('Calle 1, Centro')).toBeInTheDocument()
    expect(screen.getByText('Sin caso')).toBeInTheDocument()
  })

  it('un reporte con valores nulos muestra los textos por defecto', () => {
    const base = makeReport()
    renderCard({
      selected: { type: 'report', id: '1' },
      reports: [makeReport({ estatus_seguimiento: null, riesgo: null, edad_aproximada: null, id_caso: 4, ubicacion: { ...base.ubicacion, calle: '', colonia: '' } })],
    })
    expect(screen.getByText('Sin estatus')).toBeInTheDocument()
    expect(screen.getByText('Sin evaluar')).toBeInTheDocument()
    expect(screen.getByText('Sin dato')).toBeInTheDocument()
    expect(screen.getByText('Sin dirección')).toBeInTheDocument()
    expect(screen.getByText('#4')).toBeInTheDocument()
  })

  it('muestra el resumen de un caso y cuenta sus reportes', () => {
    renderCard({
      selected: { type: 'case', id: '3' },
      cases: [makeCase()],
      reports: [makeReport({ id_caso: 3 }), makeReport({ id_reporte: 2, id_caso: 3 }), makeReport({ id_reporte: 3, id_caso: null })],
    })
    expect(screen.getByRole('heading', { name: 'Caso #3' })).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Reportes asociados').nextSibling).toHaveTextContent('2')
  })

  it('un caso sin urgencia ni dirección muestra los textos por defecto y sin lista de reportes no cuenta', () => {
    const base = makeCase()
    renderCard({ selected: { type: 'case', id: '3' }, cases: [makeCase({ urgencia: null, ubicacion: { ...base.ubicacion, calle: null, colonia: null } })] })
    expect(screen.getByText('Sin urgencia')).toBeInTheDocument()
    expect(screen.getByText('Sin dirección')).toBeInTheDocument()
    expect(screen.queryByText('Reportes asociados')).not.toBeInTheDocument()
  })

  it('Ver más navega al detalle según el tipo', async () => {
    const report = renderCard({ selected: { type: 'report', id: '1' }, reports: [makeReport()] })
    await report.user.click(screen.getByRole('button', { name: 'Ver más' }))
    expect(report.path()).toBe('/reports/1')
  })

  it('Ver más lleva al caso en un caso', async () => {
    const view = renderCard({ selected: { type: 'case', id: '3' }, cases: [makeCase()] })
    await view.user.click(screen.getByRole('button', { name: 'Ver más' }))
    expect(view.path()).toBe('/cases/3')
  })

  it('sin el permiso del detalle no hay Ver más', () => {
    renderCard({ selected: { type: 'report', id: '1' }, reports: [makeReport()] }, makeStaff('map.view', 'cases.view'))
    expect(screen.queryByRole('button', { name: 'Ver más' })).not.toBeInTheDocument()
  })

  it('un alimentador con cases.view sí ve Ver más en un caso', () => {
    renderCard({ selected: { type: 'case', id: '3' }, cases: [makeCase()] }, makeStaff('cases.view'))
    expect(screen.getByRole('button', { name: 'Ver más' })).toBeInTheDocument()
  })

  it('el botón Cerrar llama a onClose', async () => {
    const view = renderCard({ selected: { type: 'report', id: '1' }, reports: [makeReport()] })
    await view.user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(view.onClose).toHaveBeenCalledTimes(1)
  })
})

describe('DragableMenu', () => {
  beforeEach(() => {
    // jsdom does not implement pointer capture
    Element.prototype.setPointerCapture = vi.fn()
  })

  const transformOf = (container: HTMLElement) => (container.firstChild as HTMLElement).style.transform

  it('empieza colapsado en móvil, solo asoma el borde', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>contenido</p></DragableMenu>)
    expect(transformOf(container)).toContain('translateY(calc(calc(100% - 60px)')
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('desde md se mueve en horizontal', () => {
    mockMatchMedia(true)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    expect(transformOf(container)).toContain('translateX')
  })

  it('un clic lo expande y otro lo colapsa', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(0px + 0px)')
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(100% - 60px)')
  })

  it('arrastrar hacia arriba 60 px o más lo expande', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerDown(handle, { clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 239 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(0px + 0px)')
  })

  it('arrastrar menos del umbral lo deja como estaba', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerDown(handle, { clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 270 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(100% - 60px)')
  })

  it('arrastrar hacia abajo estando expandido lo colapsa', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(handle)
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 170 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(100% - 60px)')
  })

  it('en el eje horizontal usa clientX', () => {
    mockMatchMedia(true)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 400 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(0px + 0px)')
  })

  it('mover sin haber presionado o soltar sin presionar no hace nada', () => {
    mockMatchMedia(false)
    const { container } = render(<DragableMenu><p>x</p></DragableMenu>)
    const handle = screen.getByRole('button')
    fireEvent.pointerMove(handle, { clientY: 10 })
    fireEvent.pointerUp(handle)
    expect(transformOf(container)).toContain('calc(100% - 60px)')
  })
})

describe('Filters', () => {
  const makeState = (overrides: Partial<HeatMapState> = {}) =>
    ({
      showReports: true,
      setShowReports: vi.fn(),
      showCases: true,
      setShowCases: vi.fn(),
      reportVisualOption: REPORT_VISUAL_OPTIONS[0],
      setReportVisualOption: vi.fn(),
      caseVisualOption: CASE_VISUAL_OPTIONS[0],
      setCaseVisualOption: vi.fn(),
      ageRange: [AGE_RANGE[0], AGE_RANGE[1]],
      setAgeRange: vi.fn(),
      daysRange: [DAYS_RANGE[0], DAYS_RANGE[1]],
      setDaysRange: vi.fn(),
      hourRange: [HOUR_RANGE[0], HOUR_RANGE[1]],
      setHourRange: vi.fn(),
      riskLevels: [],
      setRiskLevels: vi.fn(),
      workTypes: [],
      setWorkTypes: vi.fn(),
      weekdays: [],
      setWeekdays: vi.fn(),
      ...overrides,
    }) as unknown as HeatMapState

  it('muestra las secciones y los controles', () => {
    render(<Filters state={makeState()} />)
    expect(screen.getByRole('heading', { name: 'Filtros' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Reportes' })).toBeChecked()
    expect(screen.getByText('Rango de edades')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="slider"]')).toHaveLength(3)
  })

  it('apagar una capa llama al setter', async () => {
    const state = makeState()
    render(<Filters state={state} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Casos' }))
    expect(state.setShowCases).toHaveBeenCalled()
  })

  it('con las capas de reportes apagadas el filtro de días queda atenuado', () => {
    render(<Filters state={makeState({ showReports: false })} />)
    expect(screen.getByText('Días no atendidos').closest('div')).toHaveClass('opacity-50')
  })

  it('el resumen de la selección múltiple: vacío, hasta dos nombres o conteo', () => {
    const options = (n: number) => WORK_TYPE_OPTIONS.slice(0, n)
    const { rerender } = render(<Filters state={makeState({ riskLevels: [] })} />)
    expect(screen.getAllByText('Seleccionar').length).toBeGreaterThan(0)
    rerender(<Filters state={makeState({ workTypes: options(2) })} />)
    expect(screen.getByText('Venta ambulante, Limpieza de parabrisas')).toBeInTheDocument()
    rerender(<Filters state={makeState({ workTypes: options(3) })} />)
    expect(screen.getByText('3 seleccionados')).toBeInTheDocument()
  })

  it('un estado con control real cambia la opción de color', async () => {
    function Harness() {
      const [option, setOption] = useState<(typeof REPORT_VISUAL_OPTIONS)[number] | undefined>(REPORT_VISUAL_OPTIONS[0])
      return <DropdownSelect options={REPORT_VISUAL_OPTIONS} option={option} setOption={setOption} label="x" />
    }
    render(<Harness />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Días sin atender')
    expect(screen.getByRole('combobox')).toHaveValue('4')
  })
})
