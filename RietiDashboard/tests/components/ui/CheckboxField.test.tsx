import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CheckboxField } from '@/components/ui/CheckboxField'

describe('CheckboxField', () => {
  it('muestra la etiqueta y el estado', () => {
    render(<CheckboxField label="Ver reportes" checked setChecked={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'Ver reportes' })).toBeChecked()
  })

  it('un clic llama a setChecked con el valor nuevo', async () => {
    const setChecked = vi.fn()
    render(<CheckboxField label="Ver reportes" checked={false} setChecked={setChecked} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setChecked).toHaveBeenCalledWith(true)
  })

  it('al desmarcar manda false', async () => {
    const setChecked = vi.fn()
    render(<CheckboxField label="x" checked setChecked={setChecked} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setChecked).toHaveBeenCalledWith(false)
  })

  it('el clic en la etiqueta también cambia el valor', async () => {
    const setChecked = vi.fn()
    render(<CheckboxField label="Ver reportes" checked={false} setChecked={setChecked} />)
    await userEvent.click(screen.getByText('Ver reportes'))
    expect(setChecked).toHaveBeenCalledWith(true)
  })

  it('deshabilitado no cambia', async () => {
    const setChecked = vi.fn()
    render(<CheckboxField label="x" checked={false} setChecked={setChecked} disabled />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setChecked).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true')
  })

  it('muestra la nota debajo de la etiqueta', () => {
    render(<CheckboxField label="Editar" checked={false} setChecked={vi.fn()} hint="Requiere: Ver reportes" />)
    expect(screen.getByText('Requiere: Ver reportes')).toBeInTheDocument()
  })

  it('sin nota no hay texto extra', () => {
    render(<CheckboxField label="Editar" checked={false} setChecked={vi.fn()} />)
    expect(screen.getByText('Editar').children).toHaveLength(0)
  })

  it('con hideLabel la etiqueta queda solo para lectores de pantalla', () => {
    render(<CheckboxField label="Seleccionar REP-1" checked={false} setChecked={vi.fn()} hideLabel />)
    expect(screen.getByText('Seleccionar REP-1')).toHaveClass('sr-only')
    expect(screen.getByRole('checkbox', { name: 'Seleccionar REP-1' })).toBeInTheDocument()
  })
})
