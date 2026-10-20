import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addNote2Case, transferCase } from '@/lib/api/cases'
import { getMunicipios } from '@/lib/api/municipios'
import { changeReportState, getReportImage, unlinkReport } from '@/lib/api/reports'
import { ApiError } from '@/lib/api/client'
import type { Caso } from '@/lib/types/Case'
import type { PermissionKey } from '@/lib/types/Permission'
import { CaseCard } from '@/pages/cases/components/CaseCard'
import { CaseDataCard, Card, ReporterCard } from '@/pages/cases/components/CaseInfo'
import { CaseEditCard } from '@/pages/cases/components/CaseEditCard'
import { CaseHeader } from '@/pages/cases/components/CaseHeader'
import { CaseReportItem } from '@/pages/cases/components/CaseReportItem'
import { AddNoteCard, MetadataCard } from '@/pages/cases/components/CaseSidePanel'
import { CaseTimeline } from '@/pages/cases/components/CaseTimeline'
import { makeAdmin, makeAuth, makeStaff } from '../../helpers/auth'
import { makeCase, makeReport } from '../../helpers/fixtures'
import { renderApp } from '../../helpers/render'

vi.mock('@/lib/api/cases', () => ({ transferCase: vi.fn(), addNote2Case: vi.fn() }))
vi.mock('@/lib/api/municipios', () => ({ getMunicipios: vi.fn() }))
vi.mock('@/lib/api/reports', () => ({ changeReportState: vi.fn(), unlinkReport: vi.fn(), getReportImage: vi.fn() }))

beforeEach(() => {
  vi.mocked(transferCase).mockReset()
  vi.mocked(addNote2Case).mockReset()
  vi.mocked(getMunicipios).mockReset()
  vi.mocked(changeReportState).mockReset()
  vi.mocked(unlinkReport).mockReset()
  vi.mocked(getReportImage).mockReset()
})

const mutate = vi.fn(async (action: () => Promise<unknown>) => {
  await action()
})

const withUser = (...permissions: PermissionKey[]) => makeAuth(makeStaff(...permissions))

describe('CaseCard', () => {
  const renderCard = (caso: Caso = makeCase(), props: Partial<React.ComponentProps<typeof CaseCard>> = {}) => {
    const onOpen = vi.fn()
    const view = renderApp(<CaseCard caso={caso} reportCount={2} onOpen={onOpen} {...props} />)
    return { ...view, onOpen }
  }

  it('muestra el resumen del caso', () => {
    renderCard(makeCase({ notas: 'Visita pendiente' }))
    expect(screen.getByRole('heading', { name: 'Caso #3' })).toBeInTheDocument()
    expect(screen.getByText('Abierto')).toBeInTheDocument()
    expect(screen.getByText('Urgencia alta')).toBeInTheDocument()
    expect(screen.getByText('2 reportes')).toBeInTheDocument()
    expect(screen.getByText('Visita pendiente')).toBeInTheDocument()
  })

  it('un reporte se escribe en singular', () => {
    renderCard(makeCase(), { reportCount: 1 })
    expect(screen.getByText('1 reporte')).toBeInTheDocument()
  })

  it('cero reportes se escribe en plural', () => {
    renderCard(makeCase(), { reportCount: 0 })
    expect(screen.getByText('0 reportes')).toBeInTheDocument()
  })

  it('sin urgencia, colonia, calle ni notas muestra los textos por defecto', () => {
    const base = makeCase().ubicacion
    renderCard(makeCase({ urgencia: null, notas: null, ubicacion: { ...base, colonia: null, calle: null } }))
    expect(screen.getByText('Sin urgencia')).toBeInTheDocument()
    expect(screen.getAllByText('Sin dato')).toHaveLength(2)
  })

  it('Ver caso llama a onOpen', async () => {
    const view = renderCard()
    await view.user.click(screen.getByRole('button', { name: 'Ver caso →' }))
    expect(view.onOpen).toHaveBeenCalledTimes(1)
  })

  it('en selección muestra el checkbox y oculta el botón', async () => {
    const onToggle = vi.fn()
    const view = renderCard(makeCase(), { selection: { selected: true, onToggle } })
    expect(screen.queryByRole('button', { name: 'Ver caso →' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Seleccionar caso 3' })).toBeChecked()
    await view.user.click(screen.getByRole('article'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})

describe('CaseInfo', () => {
  it('Card muestra el título y la acción opcional', () => {
    renderApp(
      <Card title="Título" icon={<span>i</span>} tone="x" action={<button>Acción</button>}>
        <p>Contenido</p>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
  })

  it('ReporterCard usa el primer reporte', () => {
    renderApp(<ReporterCard reports={[makeReport({ id_usuario: null }), makeReport({ id_reporte: 2 })]} />)
    expect(screen.getByText('Anónimo')).toBeInTheDocument()
    expect(screen.getByText('REP-2026-0001')).toBeInTheDocument()
  })

  it('ReporterCard identifica al usuario y avisa si no hay reportes', () => {
    const { unmount } = renderApp(<ReporterCard reports={[makeReport({ id_usuario: 8 })]} />)
    expect(screen.getByText('Usuario #8')).toBeInTheDocument()
    unmount()
    renderApp(<ReporterCard reports={[]} />)
    expect(screen.getByText('Este caso no tiene reportes asociados.')).toBeInTheDocument()
  })

  it('CaseDataCard junta descripciones y fotos solo de los reportes que las tienen', async () => {
    vi.mocked(getReportImage).mockImplementation(async (id) => ({
      url_visualizacion: `https://s3.test/foto-${id}.jpg`,
      url_descarga: `https://s3.test/descarga-${id}.jpg`,
      expira_en: 300,
    }))
    renderApp(
      <CaseDataCard
        caso={makeCase()}
        reports={[
          makeReport({ id_reporte: 1, descripcion: 'Primera', imagen: '/i/1' }),
          makeReport({ id_reporte: 2, descripcion: null, imagen: null }),
          makeReport({ id_reporte: 3, descripcion: 'Tercera', imagen: '/i/3' }),
        ]}
      />,
    )
    expect(screen.getByText('Primera')).toBeInTheDocument()
    expect(screen.getByText('Tercera')).toBeInTheDocument()
    expect(await screen.findAllByRole('img')).toHaveLength(2)
    expect(getReportImage).toHaveBeenCalledTimes(2)
    expect(getReportImage).not.toHaveBeenCalledWith(2)
    expect(screen.getByText('Atizapán de Zaragoza')).toBeInTheDocument()
  })

  it('CaseDataCard sin descripciones ni fotos muestra los avisos', () => {
    renderApp(<CaseDataCard caso={makeCase()} reports={[]} />)
    expect(screen.getByText('Sin descripción')).toBeInTheDocument()
    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
  })
})

describe('CaseTimeline y MetadataCard', () => {
  it('CaseTimeline numera las entradas con su folio y nota', () => {
    renderApp(
      <CaseTimeline
        caso={makeCase({
          seguimientos: [
            { folio: 'SEG-2026-0003-01', fecha: '2026-03-01T12:00:00', tipo: 'Recepción de reporte', autor: 'Sistema', nota: null },
            { folio: 'SEG-2026-0003-02', fecha: '2026-03-02T12:00:00', tipo: 'Nota', autor: 'Ana', nota: 'Se visitó' },
          ],
        })}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('SEG-2026-0003-02')).toBeInTheDocument()
    expect(screen.getByText('Se visitó')).toBeInTheDocument()
  })

  it('CaseTimeline sin seguimientos deriva la recepción', () => {
    renderApp(<CaseTimeline caso={makeCase()} />)
    expect(screen.getByText('SEG-2026-0003-01')).toBeInTheDocument()
    expect(screen.getByText('Recepción de reporte')).toBeInTheDocument()
  })

  it('MetadataCard muestra folio, conteo y coordenadas con cinco decimales', () => {
    renderApp(<MetadataCard caso={makeCase()} reports={[makeReport()]} />)
    expect(screen.getByText('CASO-2026-0003')).toBeInTheDocument()
    expect(screen.getByText('19.57000, -99.25000')).toBeInTheDocument()
  })

  it('MetadataCard sin coordenadas dice "No disponibles"', () => {
    const base = makeCase().ubicacion
    renderApp(<MetadataCard caso={makeCase({ ubicacion: { ...base, lat: null, lng: null } })} reports={[]} />)
    expect(screen.getByText('No disponibles')).toBeInTheDocument()
  })
})

describe('AddNoteCard', () => {
  it('el botón se habilita con texto y guarda la nota recortada, luego limpia', async () => {
    vi.mocked(addNote2Case).mockResolvedValue({} as never)
    const view = renderApp(<AddNoteCard caso={makeCase()} mutate={mutate} />)
    const button = screen.getByRole('button', { name: 'Guardar nota' })
    expect(button).toBeDisabled()
    await view.user.type(screen.getByLabelText('Nueva nota de seguimiento'), '   ')
    expect(button).toBeDisabled()
    await view.user.type(screen.getByLabelText('Nueva nota de seguimiento'), ' Visita  ')
    await view.user.click(button)
    expect(addNote2Case).toHaveBeenCalledWith(3, 'Visita')
    await waitFor(() => expect(screen.getByLabelText('Nueva nota de seguimiento')).toHaveValue(''))
  })

  it('si falla muestra el error y conserva el texto', async () => {
    vi.mocked(addNote2Case).mockRejectedValue(new ApiError(422, 'Nota vacía'))
    const view = renderApp(<AddNoteCard caso={makeCase()} mutate={mutate} />)
    await view.user.type(screen.getByLabelText('Nueva nota de seguimiento'), 'Hola')
    await view.user.click(screen.getByRole('button', { name: 'Guardar nota' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nota vacía')
    expect(screen.getByLabelText('Nueva nota de seguimiento')).toHaveValue('Hola')
  })
})

describe('CaseEditCard', () => {
  const renderEdit = (user = makeAuth(makeStaff('cases.edit')), caso = makeCase({ notas: 'Antigua' })) => {
    const saveChanges = vi.fn().mockResolvedValue(undefined)
    const view = renderApp(<CaseEditCard caso={caso} saveChanges={saveChanges} />, { auth: user })
    return { ...view, saveChanges }
  }

  it('sin cases.edit no hay botón Editar', () => {
    renderEdit(withUser('cases.view'))
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('muestra los datos del caso y la última nota', () => {
    renderEdit()
    expect(screen.getByText('Campo')).toBeInTheDocument()
    expect(screen.getByText('Antigua')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('sin urgencia ni notas muestra los avisos', () => {
    renderEdit(makeAuth(makeAdmin()), makeCase({ urgencia: null, notas: null }))
    expect(screen.getByText('Sin urgencia')).toBeInTheDocument()
    expect(screen.getByText('Sin notas')).toBeInTheDocument()
  })

  it('Guardar está deshabilitado mientras nada cambie', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('manda solo los campos que cambiaron', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Baja')
    await view.user.selectOptions(screen.getByLabelText('Cantidad de niños'), '4')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.saveChanges).toHaveBeenCalledWith({ patch: { urgencia: 'Baja', cantidad_nna: 4 }, nota: null })
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument())
  })

  it('cambiar un campo y devolverlo a su valor original no cuenta como cambio', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Baja')
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Alta')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('una nota nueva se manda recortada y una igual a la anterior no cuenta', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    const note = screen.getByLabelText('Nota')
    await view.user.type(note, ' x')
    await view.user.clear(note)
    await view.user.type(note, '  Antigua  ')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    await view.user.clear(note)
    await view.user.type(note, ' Nueva ')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(view.saveChanges).toHaveBeenCalledWith({ patch: {}, nota: 'Nueva' })
  })

  it('una nota vacía no se envía', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.clear(screen.getByLabelText('Nota'))
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('si guardar falla muestra el error y deja el formulario abierto', async () => {
    const saveChanges = vi.fn().mockRejectedValue(new Error('No se pudieron guardar los datos'))
    const view = renderApp(<CaseEditCard caso={makeCase()} saveChanges={saveChanges} />, { auth: withUser('cases.edit') })
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Baja')
    await view.user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar los datos')
    expect(screen.getByLabelText('Urgencia')).toBeInTheDocument()
  })

  it('Cancelar cierra el formulario y olvida los cambios', async () => {
    const view = renderEdit()
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Baja')
    await view.user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByLabelText('Urgencia')).toHaveValue('Alta')
  })

  it('un caso sin urgencia ofrece "Sin urgencia" y no se puede volver a ella', async () => {
    const view = renderEdit(withUser('cases.edit'), makeCase({ urgencia: null }))
    await view.user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByRole('option', { name: 'Sin urgencia' })).toBeDisabled()
    await view.user.selectOptions(screen.getByLabelText('Urgencia'), 'Media')
    expect(screen.queryByRole('option', { name: 'Sin urgencia' })).not.toBeInTheDocument()
  })
})

describe('CaseHeader', () => {
  const update = vi.fn().mockResolvedValue(undefined)
  const renderHeader = (auth: ReturnType<typeof makeAuth>, caso: Caso = makeCase(), firstReport = makeReport()) =>
    renderApp(<CaseHeader caso={caso} firstReport={firstReport} mutate={mutate} update={update} />, { auth })

  beforeEach(() => {
    update.mockClear()
  })

  it('muestra el folio, el estado, la urgencia y el origen', () => {
    renderHeader(withUser())
    expect(screen.getByRole('heading', { name: 'CASO-2026-0003' })).toBeInTheDocument()
    expect(screen.getByText('Urgencia alta')).toBeInTheDocument()
    expect(screen.getByText('Origen: Reporte del usuario #5')).toBeInTheDocument()
  })

  it.each([
    [makeReport({ id_usuario: null }), 'Origen: Reporte ciudadano anónimo'],
    [undefined, 'Origen: Sin reporte asociado'],
  ])('describe el origen cuando el primer reporte es %#', (report, text) => {
    renderApp(<CaseHeader caso={makeCase()} firstReport={report} mutate={mutate} update={update} />, { auth: withUser() })
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('sin urgencia ni colonia muestra los textos por defecto', () => {
    const base = makeCase().ubicacion
    renderHeader(withUser(), makeCase({ urgencia: null, ubicacion: { ...base, colonia: null } }))
    expect(screen.getByText('Sin urgencia')).toBeInTheDocument()
    expect(screen.getByText('Sin dato')).toBeInTheDocument()
  })

  it('sin permisos de edición no hay botones de estado ni de transferencia', () => {
    renderHeader(withUser('cases.view'))
    expect(screen.queryByRole('group', { name: 'Estado del caso' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Transferir/ })).not.toBeInTheDocument()
  })

  it('con cases.edit puede mover a Abierto/En desarrollo pero Cerrado queda bloqueado', () => {
    renderHeader(withUser('cases.edit'))
    expect(screen.getByRole('button', { name: 'En desarrollo' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeDisabled()
  })

  it('con cases.close solo puede cerrar', () => {
    renderHeader(withUser('cases.close'))
    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'En desarrollo' })).toBeDisabled()
  })

  it('cambia el estado y pulsar el estado actual no hace nada', async () => {
    const view = renderHeader(makeAuth(makeAdmin()))
    await view.user.click(screen.getByRole('button', { name: 'Abierto' }))
    expect(update).not.toHaveBeenCalled()
    await view.user.click(screen.getByRole('button', { name: 'En desarrollo' }))
    expect(update).toHaveBeenCalledWith({ estado: 'En desarrollo' })
  })

  it('si cambiar el estado falla muestra el error', async () => {
    update.mockRejectedValueOnce(new ApiError(403, 'Sin permiso'))
    const view = renderHeader(makeAuth(makeAdmin()))
    await view.user.click(screen.getByRole('button', { name: 'Cerrado' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin permiso')
  })

  it('Volver lleva a la lista de casos', async () => {
    const view = renderHeader(withUser())
    await view.user.click(screen.getByRole('button', { name: '← Volver' }))
    expect(view.path()).toBe('/cases')
  })

  describe('transferencia', () => {
    const municipios = [
      { id_municipio: 3, nombre: 'Zumpango', clave: '1' },
      { id_municipio: 1, nombre: 'Atizapán de Zaragoza', clave: '2' },
      { id_municipio: 2, nombre: 'Álvaro', clave: '3' },
    ]

    it('lista los municipios menos el actual, en orden alfabético', async () => {
      vi.mocked(getMunicipios).mockResolvedValue(municipios)
      const view = renderHeader(withUser('cases.assign'))
      await view.user.click(screen.getByRole('button', { name: /Transferir a municipio/ }))
      const options = await screen.findAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual(['Selecciona un municipio…', 'Álvaro', 'Zumpango'])
    })

    it('confirma la transferencia con el municipio elegido y cierra el paso', async () => {
      vi.mocked(getMunicipios).mockResolvedValue(municipios)
      vi.mocked(transferCase).mockResolvedValue(makeCase())
      const view = renderHeader(withUser('cases.assign'))
      await view.user.click(screen.getByRole('button', { name: /Transferir a municipio/ }))
      const select = await screen.findByLabelText('Municipio destino')
      const confirm = screen.getByRole('button', { name: 'Confirmar transferencia' })
      expect(confirm).toBeDisabled()
      await waitFor(() => expect(select).toBeEnabled())
      await view.user.selectOptions(select, 'Zumpango')
      await view.user.click(confirm)
      expect(transferCase).toHaveBeenCalledWith(3, 3)
      await waitFor(() => expect(screen.queryByLabelText('Municipio destino')).not.toBeInTheDocument())
    })

    it('si no se pueden cargar los municipios lo dice', async () => {
      vi.mocked(getMunicipios).mockRejectedValue(new ApiError(500, 'caído'))
      const view = renderHeader(withUser('cases.assign'))
      await view.user.click(screen.getByRole('button', { name: /Transferir a municipio/ }))
      expect(await screen.findByRole('option', { name: 'No se pudieron cargar los municipios' })).toBeInTheDocument()
      expect(screen.getByLabelText('Municipio destino')).toBeDisabled()
    })

    it('si la transferencia falla muestra el error y deja el paso abierto', async () => {
      vi.mocked(getMunicipios).mockResolvedValue(municipios)
      vi.mocked(transferCase).mockRejectedValue(new ApiError(404, 'Municipio no existe'))
      const view = renderHeader(withUser('cases.assign'))
      await view.user.click(screen.getByRole('button', { name: /Transferir a municipio/ }))
      const select = await screen.findByLabelText('Municipio destino')
      await waitFor(() => expect(select).toBeEnabled())
      await view.user.selectOptions(select, 'Zumpango')
      await view.user.click(screen.getByRole('button', { name: 'Confirmar transferencia' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Municipio no existe')
      expect(screen.getByLabelText('Municipio destino')).toBeInTheDocument()
    })

    it('el botón alterna el paso y solo carga los municipios una vez', async () => {
      vi.mocked(getMunicipios).mockResolvedValue(municipios)
      const view = renderHeader(withUser('cases.assign'))
      const button = screen.getByRole('button', { name: /Transferir a municipio/ })
      await view.user.click(button)
      await screen.findByLabelText('Municipio destino')
      await view.user.click(button)
      expect(screen.queryByLabelText('Municipio destino')).not.toBeInTheDocument()
      await view.user.click(button)
      expect(getMunicipios).toHaveBeenCalledTimes(1)
    })
  })
})

describe('CaseReportItem', () => {
  const renderItem = (auth: ReturnType<typeof makeAuth>, report = makeReport({ estatus_seguimiento: 'Canalizado', id_caso: 3 })) =>
    renderApp(<CaseReportItem report={report} mutate={mutate} />, { auth })

  it('muestra el reporte con su estatus', () => {
    renderItem(withUser())
    expect(screen.getByRole('heading', { name: 'REP-2026-0001' })).toBeInTheDocument()
    expect(screen.getAllByText('Canalizado').length).toBeGreaterThan(0)
  })

  it('sin permisos el seguimiento está bloqueado y no hay botón de desvincular', () => {
    renderItem(withUser('cases.view'))
    expect(screen.getByLabelText('Seguimiento')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Desvincular del caso' })).not.toBeInTheDocument()
  })

  it('con reports.edit puede cambiar a En atención pero no a Concluido', async () => {
    vi.mocked(changeReportState).mockResolvedValue({ id_reporte: 1, estatus_seguimiento: 'En atención' })
    const view = renderItem(withUser('reports.edit'))
    expect(screen.getByRole('option', { name: 'Concluido' })).toBeDisabled()
    await view.user.selectOptions(screen.getByLabelText('Seguimiento'), 'En atención')
    expect(changeReportState).toHaveBeenCalledWith(1, 'En atención')
  })

  it('un estatus fuera del flujo aparece como opción actual', () => {
    renderItem(makeAuth(makeAdmin()), makeReport({ estatus_seguimiento: 'Recibido' }))
    expect(screen.getByLabelText('Seguimiento')).toHaveValue('Recibido')
  })

  it('un reporte rechazado solo lo mueve un administrador', () => {
    renderItem(withUser('reports.edit', 'reports.close'), makeReport({ estatus_seguimiento: 'Rechazado' }))
    expect(screen.getByLabelText('Seguimiento')).toBeDisabled()
  })

  it('un administrador sí puede mover un reporte rechazado', () => {
    renderItem(makeAuth(makeAdmin()), makeReport({ estatus_seguimiento: 'Rechazado' }))
    expect(screen.getByLabelText('Seguimiento')).toBeEnabled()
  })

  it('sin estatus muestra "Sin estatus" y el select queda en blanco', () => {
    renderItem(makeAuth(makeAdmin()), makeReport({ estatus_seguimiento: null }))
    expect(screen.getByText('Sin estatus')).toBeInTheDocument()
  })

  it('desvincular llama a la API', async () => {
    vi.mocked(unlinkReport).mockResolvedValue({ id_reporte: 1, id_caso: null, estatus_seguimiento: 'En revisión' })
    const view = renderItem(withUser('reports.edit'))
    await view.user.click(screen.getByRole('button', { name: 'Desvincular del caso' }))
    expect(unlinkReport).toHaveBeenCalledWith(1)
  })

  it('si desvincular falla muestra el error', async () => {
    vi.mocked(unlinkReport).mockRejectedValue(new ApiError(409, 'Sin caso'))
    const view = renderItem(withUser('reports.edit'))
    await view.user.click(screen.getByRole('button', { name: 'Desvincular del caso' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin caso')
  })
})
