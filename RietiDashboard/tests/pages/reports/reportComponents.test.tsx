import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCases } from '@/lib/api/cases'
import { acceptReport, declineReport, fuseReport, reopenReport } from '@/lib/api/reports'
import { ApiError } from '@/lib/api/client'
import type { PermissionKey } from '@/lib/types/Permission'
import { ReportActions } from '@/pages/reports/components/ReportActions'
import { ReportCard } from '@/pages/reports/components/ReportCard'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { makeCase, makeReport } from '../../helpers/fixtures'
import { renderApp } from '../../helpers/render'

vi.mock('@/lib/api/cases', () => ({ getCases: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({
  acceptReport: vi.fn(),
  declineReport: vi.fn(),
  fuseReport: vi.fn(),
  reopenReport: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getCases).mockReset().mockResolvedValue([])
  vi.mocked(acceptReport).mockReset()
  vi.mocked(declineReport).mockReset()
  vi.mocked(fuseReport).mockReset()
  vi.mocked(reopenReport).mockReset()
})

const full: PermissionKey[] = ['reports.view', 'reports.edit', 'reports.close', 'cases.view']

const renderActions = (user: ReturnType<typeof makeStaff>, report = makeReport()) => {
  const onAccepted = vi.fn()
  const onChanged = vi.fn()
  const view = renderApp(<ReportActions report={report} onAccepted={onAccepted} onChanged={onChanged} />, { auth: makeAuth(user) })
  return { ...view, onAccepted, onChanged }
}

describe('ReportActions: qué botones ve cada usuario', () => {
  it('con todos los permisos ve aceptar, fusionar y rechazar', () => {
    renderActions(makeStaff(...full))
    expect(screen.getByRole('button', { name: 'Aceptar y crear caso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fusionar con un caso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument()
  })

  it('sin cases.view no puede fusionar', () => {
    renderActions(makeStaff('reports.edit', 'reports.close'))
    expect(screen.queryByRole('button', { name: 'Fusionar con un caso' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aceptar y crear caso' })).toBeInTheDocument()
  })

  it('solo con reports.close solo ve Rechazar', () => {
    renderActions(makeStaff('reports.close'))
    expect(screen.queryByRole('button', { name: 'Aceptar y crear caso' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument()
  })

  it('sin ninguno de los dos permisos muestra el aviso', () => {
    renderActions(makeStaff('reports.view'))
    expect(screen.getByText('No tienes permiso para gestionar este reporte.')).toBeInTheDocument()
  })

  it('un reporte con caso solo informa el caso', () => {
    renderActions(makeAdmin(), makeReport({ id_caso: 4 }))
    expect(screen.getByText('Este reporte ya fue canalizado al caso #4.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('un reporte rechazado: un alimentador solo ve el aviso', () => {
    renderActions(makeStaff(...full), makeReport({ estatus_seguimiento: 'Rechazado' }))
    expect(screen.getByText('Este reporte fue rechazado.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reabrir reporte' })).not.toBeInTheDocument()
  })

  it('un reporte rechazado: el administrador puede reabrirlo', async () => {
    vi.mocked(reopenReport).mockResolvedValue({ id_reporte: 1, id_caso: null, estatus_seguimiento: 'Recibido' })
    const view = renderActions(makeAdmin(), makeReport({ estatus_seguimiento: 'Rechazado' }))
    await view.user.click(screen.getByRole('button', { name: 'Reabrir reporte' }))
    expect(reopenReport).toHaveBeenCalledWith(1)
    await waitFor(() => expect(view.onChanged).toHaveBeenCalledTimes(1))
  })

  it('si reabrir falla muestra el error y no recarga', async () => {
    vi.mocked(reopenReport).mockRejectedValue(new ApiError(409, 'No está rechazado'))
    const view = renderActions(makeAdmin(), makeReport({ estatus_seguimiento: 'Rechazado' }))
    await view.user.click(screen.getByRole('button', { name: 'Reabrir reporte' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No está rechazado')
    expect(view.onChanged).not.toHaveBeenCalled()
  })
})

describe('ReportActions: aceptar', () => {
  it('crea el caso, recarga y avisa el id si puede ver casos', async () => {
    vi.mocked(acceptReport).mockResolvedValue({ id_caso: 9, id_reporte: 1, estatus_seguimiento: 'Canalizado' })
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Aceptar y crear caso' }))
    await waitFor(() => expect(view.onAccepted).toHaveBeenCalledWith(9))
    expect(view.onChanged).toHaveBeenCalledTimes(1)
  })

  it('sin cases.view recarga pero no navega al caso', async () => {
    vi.mocked(acceptReport).mockResolvedValue({ id_caso: 9, id_reporte: 1, estatus_seguimiento: 'Canalizado' })
    const view = renderActions(makeStaff('reports.edit'))
    await view.user.click(screen.getByRole('button', { name: 'Aceptar y crear caso' }))
    await waitFor(() => expect(view.onChanged).toHaveBeenCalled())
    expect(view.onAccepted).not.toHaveBeenCalled()
  })

  it('si falla muestra el error y no recarga', async () => {
    vi.mocked(acceptReport).mockRejectedValue(new ApiError(409, 'Ya tiene caso'))
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Aceptar y crear caso' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tiene caso')
    expect(view.onChanged).not.toHaveBeenCalled()
    expect(view.onAccepted).not.toHaveBeenCalled()
  })
})

describe('ReportActions: fusionar', () => {
  it('lista solo los casos abiertos, primero los de la misma colonia', async () => {
    vi.mocked(getCases).mockResolvedValue([
      makeCase({ id_caso: 1, estado: 'Cerrado' }),
      makeCase({ id_caso: 2, ubicacion: { ...makeCase().ubicacion, colonia: 'Otra' } }),
      makeCase({ id_caso: 3 }),
    ])
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    const options = await screen.findAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['Selecciona un caso…', 'Caso #3 · Centro · Abierto', 'Caso #2 · Otra · Abierto'])
  })

  it('un caso sin colonia muestra "Sin dato"', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ ubicacion: { ...makeCase().ubicacion, colonia: null } })])
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    expect(await screen.findByRole('option', { name: /Sin dato/ })).toBeInTheDocument()
  })

  it('sin casos abiertos lo dice', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ estado: 'Cerrado' })])
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    expect(await screen.findByText('No hay casos abiertos para fusionar.')).toBeInTheDocument()
  })

  it('el botón de confirmar se habilita al elegir y fusiona con el caso elegido', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase({ id_caso: 3 })])
    vi.mocked(fuseReport).mockResolvedValue({ id_reporte: 1, id_caso: 3, estatus_seguimiento: 'Canalizado' })
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    const confirm = await screen.findByRole('button', { name: 'Confirmar fusión' })
    expect(confirm).toBeDisabled()
    await view.user.selectOptions(screen.getByLabelText('Caso destino'), '3')
    await view.user.click(confirm)
    expect(fuseReport).toHaveBeenCalledWith(1, 3)
    await waitFor(() => expect(view.onChanged).toHaveBeenCalled())
    expect(screen.queryByLabelText('Caso destino')).not.toBeInTheDocument()
  })

  it('alterna el paso al pulsar otra vez y solo carga los casos una vez', async () => {
    vi.mocked(getCases).mockResolvedValue([makeCase()])
    const view = renderActions(makeStaff(...full))
    const button = screen.getByRole('button', { name: 'Fusionar con un caso' })
    await view.user.click(button)
    await screen.findByLabelText('Caso destino')
    await view.user.click(button)
    expect(screen.queryByLabelText('Caso destino')).not.toBeInTheDocument()
    await view.user.click(button)
    expect(getCases).toHaveBeenCalledTimes(1)
  })

  it('si no se pueden cargar los casos muestra el error', async () => {
    vi.mocked(getCases).mockRejectedValue(new ApiError(500, 'caído'))
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('caído')
  })
})

describe('ReportActions: rechazar', () => {
  it('pide confirmación, rechaza y recarga', async () => {
    vi.mocked(declineReport).mockResolvedValue({ id_reporte: 1, id_caso: null, estatus_seguimiento: 'Rechazado' })
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    expect(screen.getByText('¿Rechazar este reporte? No se creará ningún caso.')).toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Sí, rechazar' }))
    expect(declineReport).toHaveBeenCalledWith(1)
    await waitFor(() => expect(view.onChanged).toHaveBeenCalled())
  })

  it('Cancelar cierra la confirmación sin llamar a la API', async () => {
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    await view.user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText(/¿Rechazar este reporte/)).not.toBeInTheDocument()
    expect(declineReport).not.toHaveBeenCalled()
  })

  it('si falla muestra el error y deja la confirmación', async () => {
    vi.mocked(declineReport).mockRejectedValue(new ApiError(409, 'Ya tiene caso'))
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    await view.user.click(screen.getByRole('button', { name: 'Sí, rechazar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tiene caso')
    expect(view.onChanged).not.toHaveBeenCalled()
  })

  it('abrir rechazar y fusionar son pasos excluyentes', async () => {
    const view = renderActions(makeStaff(...full))
    await view.user.click(screen.getByRole('button', { name: 'Rechazar' }))
    await view.user.click(screen.getByRole('button', { name: 'Fusionar con un caso' }))
    expect(screen.queryByText(/¿Rechazar este reporte/)).not.toBeInTheDocument()
  })
})

describe('ReportCard', () => {
  const renderCard = (props: Partial<React.ComponentProps<typeof ReportCard>> = {}, user = makeStaff(...full, 'reports.view_detail')) => {
    const onCaseCreated = vi.fn()
    const onChanged = vi.fn()
    const view = renderApp(
      <ReportCard report={makeReport()} onCaseCreated={onCaseCreated} onChanged={onChanged} {...props} />,
      { auth: makeAuth(user) },
    )
    return { ...view, onCaseCreated, onChanged }
  }

  it('muestra el resumen del reporte', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    expect(screen.getByText('Recibido')).toBeInTheDocument()
    expect(screen.getByText('Venta ambulante')).toBeInTheDocument()
    expect(screen.getByText('Riesgo medio')).toBeInTheDocument()
    expect(screen.getByText('Niño vendiendo dulces')).toBeInTheDocument()
    expect(screen.getByText(/2 menores, 6-11 años/)).toBeInTheDocument()
    expect(screen.getByText(/Reportado por usuario #5/)).toBeInTheDocument()
  })

  it('con valores nulos muestra los textos de "sin dato" y reporte anónimo', () => {
    renderCard({
      report: makeReport({
        estatus_seguimiento: null,
        riesgo: null,
        descripcion: null,
        id_usuario: null,
        tipo_trabajo: 'Desconocido' as never,
        edad_aproximada: null,
      }),
    })
    expect(screen.getByText('Sin estatus')).toBeInTheDocument()
    expect(screen.getByText('Riesgo sin dato')).toBeInTheDocument()
    expect(screen.getByText('Sin descripción')).toBeInTheDocument()
    expect(screen.getByText(/Reporte anónimo/)).toBeInTheDocument()
    expect(screen.getByText(/Edad sin dato/)).toBeInTheDocument()
    expect(screen.queryByText('Desconocido')).not.toBeInTheDocument()
  })

  it('un riesgo fuera del catálogo se muestra sin romper', () => {
    renderCard({ report: makeReport({ riesgo: 'Extremo' as never }) })
    expect(screen.getByText('Riesgo extremo')).toBeInTheDocument()
  })

  it('el botón Detalle expande y oculta el detalle y las acciones', async () => {
    const view = renderCard()
    const button = screen.getByRole('button', { name: 'Detalle ↓' })
    await view.user.click(button)
    expect(screen.getByRole('button', { name: 'Ocultar detalle ↑' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Gestionar reporte')).toBeInTheDocument()
    expect(screen.queryByText(/Descripción:/)).not.toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: 'Ocultar detalle ↑' }))
    expect(screen.queryByText('Gestionar reporte')).not.toBeInTheDocument()
  })

  it('Abrir página solo existe con reports.view_detail y navega al reporte', async () => {
    const view = renderCard()
    await view.user.click(screen.getByRole('button', { name: 'Abrir página' }))
    expect(view.path()).toBe('/reports/1')
  })

  it('sin reports.view_detail no hay Abrir página', () => {
    renderCard({}, makeStaff('reports.view'))
    expect(screen.queryByRole('button', { name: 'Abrir página' })).not.toBeInTheDocument()
  })

  it('en modo selección muestra el checkbox, oculta los botones y alterna al hacer clic', async () => {
    const onToggle = vi.fn()
    const view = renderCard({ selection: { selected: false, onToggle } })
    expect(screen.queryByRole('button', { name: 'Detalle ↓' })).not.toBeInTheDocument()
    await view.user.click(screen.getByRole('checkbox', { name: 'Seleccionar REP-2026-0001' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
    await view.user.click(screen.getByRole('article'))
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it('en modo selección muestra el resumen aunque estuviera expandido', () => {
    renderCard({ selection: { selected: true, onToggle: vi.fn() } })
    expect(screen.getByText(/Descripción:/)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
