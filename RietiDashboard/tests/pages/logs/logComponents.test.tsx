import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LogCard } from '@/pages/logs/components/LogCard'
import { LogDetail } from '@/pages/logs/components/LogDetail'
import { LogRow } from '@/pages/logs/components/LogRow'
import { LogTable } from '@/pages/logs/components/LogTable'
import { makeLog } from '../../helpers/fixtures'

const inTable = (row: React.ReactElement) => (
  <table>
    <tbody>{row}</tbody>
  </table>
)

describe('LogDetail', () => {
  it('muestra el JSON de antes y después', () => {
    render(<LogDetail before={{ a: 1 }} after={{ a: 2 }} />)
    expect(screen.getByRole('region', { name: 'Antes' })).toHaveTextContent('"a": 1')
    expect(screen.getByRole('region', { name: 'Después' })).toHaveTextContent('"a": 2')
  })

  it('null o vacío muestra "Sin datos"', () => {
    render(<LogDetail before={{}} after={null} />)
    expect(screen.getAllByText('Sin datos')).toHaveLength(2)
  })
})

describe('LogRow', () => {
  it('muestra los datos del log y el botón para ver el detalle', async () => {
    const onToggle = vi.fn()
    render(inTable(<LogRow log={makeLog()} expanded={false} onToggle={onToggle} />))
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Actualizar')).toBeInTheDocument()
    expect(screen.getByText('Reporte')).toBeInTheDocument()
    expect(screen.getByText('#9')).toBeInTheDocument()
    expect(screen.queryByText('Antes')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalle' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('expandido muestra el detalle y cambia el botón', () => {
    render(inTable(<LogRow log={makeLog({ after_data: null })} expanded onToggle={vi.fn()} />))
    expect(screen.getByRole('button', { name: 'Ocultar detalle' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
  })
})

describe('LogTable', () => {
  it('pinta una fila por log con sus encabezados', () => {
    render(<LogTable logs={[makeLog({ id_logs: 1 }), makeLog({ id_logs: 2, usuario: 'Luis' })]} expandedId={null} onToggle={vi.fn()} />)
    expect(screen.getAllByRole('columnheader')).toHaveLength(6)
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('Luis')).toBeInTheDocument()
  })

  it('solo expande la fila cuyo id coincide y avisa el id al alternar', async () => {
    const onToggle = vi.fn()
    render(<LogTable logs={[makeLog({ id_logs: 1 }), makeLog({ id_logs: 2 })]} expandedId={2} onToggle={onToggle} />)
    expect(screen.getAllByRole('button', { name: 'Ocultar detalle' })).toHaveLength(1)
    await userEvent.click(screen.getAllByRole('button', { name: 'Ver detalle' })[0])
    expect(onToggle).toHaveBeenCalledWith(1)
  })

  it('sin logs solo queda el encabezado', () => {
    render(<LogTable logs={[]} expandedId={null} onToggle={vi.fn()} />)
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})

describe('LogCard', () => {
  it('abre y cierra los cambios', async () => {
    render(<LogCard log={makeLog()} />)
    expect(screen.getByText('Log #1')).toBeInTheDocument()
    expect(screen.getByText('reporte #9')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver cambios' }))
    expect(screen.getByText('Antes')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar cambios' }))
    expect(screen.queryByText('Antes')).not.toBeInTheDocument()
  })

  it('un before o after vacío o null muestra una raya', async () => {
    render(<LogCard log={makeLog({ before_data: {}, after_data: null })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ver cambios' }))
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})

