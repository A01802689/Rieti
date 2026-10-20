import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectionToolbar } from '@/components/ui/SelectionToolbar'
import type { Selection } from '@/lib/utilities/useSelection'

const makeSelection = (overrides: Partial<Selection> = {}): Selection => ({
  active: false,
  ids: [],
  isSelected: () => false,
  start: vi.fn(),
  toggle: vi.fn(),
  clear: vi.fn(),
  ...overrides,
})

const renderToolbar = (selection: Selection, onDelete = vi.fn().mockResolvedValue({ eliminados: [], omitidos: [] })) => {
  render(<SelectionToolbar selection={selection} onDelete={onDelete} singular="reporte" plural="reportes" skippedReason="ya no existen" />)
  return onDelete
}

describe('SelectionToolbar', () => {
  it('fuera del modo solo ofrece Seleccionar', async () => {
    const selection = makeSelection()
    renderToolbar(selection)
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar' }))
    expect(selection.start).toHaveBeenCalledTimes(1)
  })

  it('en el modo ofrece Cancelar y Eliminar con el conteo', async () => {
    const selection = makeSelection({ active: true, ids: [1, 2] })
    renderToolbar(selection)
    expect(screen.getByRole('button', { name: 'Eliminar (2)' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(selection.clear).toHaveBeenCalledTimes(1)
  })

  it('Eliminar está deshabilitado sin elegidos', () => {
    renderToolbar(makeSelection({ active: true, ids: [] }))
    expect(screen.getByRole('button', { name: 'Eliminar (0)' })).toBeDisabled()
  })

  it('pide confirmación con singular o plural según el conteo', async () => {
    const { rerender } = render(
      <SelectionToolbar selection={makeSelection({ active: true, ids: [1] })} onDelete={vi.fn()} singular="reporte" plural="reportes" skippedReason="r" />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    expect(screen.getByRole('group', { name: 'Confirmar eliminación' })).toHaveTextContent('¿Eliminar 1 reporte?')
    rerender(<SelectionToolbar selection={makeSelection({ active: true, ids: [1, 2] })} onDelete={vi.fn()} singular="reporte" plural="reportes" skippedReason="r" />)
    expect(screen.getByRole('group')).toHaveTextContent('¿Eliminar 2 reportes?')
  })

  it('"No eliminar" cierra la confirmación sin borrar', async () => {
    const onDelete = renderToolbar(makeSelection({ active: true, ids: [1] }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'No eliminar' }))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('el botón Eliminar abre y cierra la confirmación', async () => {
    renderToolbar(makeSelection({ active: true, ids: [1] }))
    const button = screen.getByRole('button', { name: 'Eliminar (1)' })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(button)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('confirmar borra y cierra la confirmación sin mensaje si nada se omitió', async () => {
    const onDelete = renderToolbar(makeSelection({ active: true, ids: [1] }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('avisa en singular cuando se omitió uno', async () => {
    renderToolbar(makeSelection({ active: true, ids: [1, 2] }), vi.fn().mockResolvedValue({ eliminados: [1], omitidos: [2] }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (2)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('1 reporte no se pudo eliminar (ya no existen)')
  })

  it('avisa en plural cuando se omitieron varios', async () => {
    renderToolbar(makeSelection({ active: true, ids: [1, 2, 3] }), vi.fn().mockResolvedValue({ eliminados: [], omitidos: [1, 2] }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (3)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('2 reportes no se pudieron eliminar (ya no existen)')
  })

  it('un fallo muestra el mensaje y deja abierta la confirmación', async () => {
    renderToolbar(makeSelection({ active: true, ids: [1] }), vi.fn().mockRejectedValue(new Error('Sin conexión')))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión')
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('un fallo que no es Error usa el mensaje general', async () => {
    renderToolbar(makeSelection({ active: true, ids: [1] }), vi.fn().mockRejectedValue('x'))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo completar la eliminación')
  })

  it('mientras borra deshabilita los botones', async () => {
    let finish: (value: { eliminados: number[]; omitidos: number[] }) => void = () => undefined
    const onDelete = vi.fn(() => new Promise<{ eliminados: number[]; omitidos: number[] }>((resolve) => (finish = resolve)))
    renderToolbar(makeSelection({ active: true, ids: [1] }), onDelete)
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    expect(screen.getByRole('button', { name: 'Sí, eliminar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    finish({ eliminados: [1], omitidos: [] })
    expect(await screen.findByRole('button', { name: 'Cancelar' })).toBeEnabled()
  })

  it('iniciar una nueva selección borra el mensaje anterior', async () => {
    const { rerender } = render(
      <SelectionToolbar
        selection={makeSelection({ active: true, ids: [1] })}
        onDelete={vi.fn().mockResolvedValue({ eliminados: [], omitidos: [1] })}
        singular="reporte"
        plural="reportes"
        skippedReason="r"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    await screen.findByRole('status')
    const start = vi.fn()
    rerender(
      <SelectionToolbar selection={makeSelection({ active: false, start })} onDelete={vi.fn()} singular="reporte" plural="reportes" skippedReason="r" />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Seleccionar' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(start).toHaveBeenCalled()
  })

  it('si se vacía la selección con la confirmación abierta, la confirmación se cierra', async () => {
    const { rerender } = render(
      <SelectionToolbar selection={makeSelection({ active: true, ids: [1] })} onDelete={vi.fn()} singular="reporte" plural="reportes" skippedReason="r" />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    rerender(<SelectionToolbar selection={makeSelection({ active: true, ids: [] })} onDelete={vi.fn()} singular="reporte" plural="reportes" skippedReason="r" />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('Cancelar cierra la confirmación y limpia el error', async () => {
    const selection = makeSelection({ active: true, ids: [1] })
    renderToolbar(selection, vi.fn().mockRejectedValue(new Error('mal')))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar (1)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(selection.clear).toHaveBeenCalled()
  })
})
