import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from '@/components/ui/SelectField'

describe('SelectField', () => {
  it('muestra la etiqueta, las opciones y el valor', () => {
    render(<SelectField label="Urgencia" value="Media" options={['Baja', 'Media', 'Alta']} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Urgencia')).toHaveValue('Media')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Baja', 'Media', 'Alta'])
  })

  it('con value null muestra el texto por defecto como opción deshabilitada', () => {
    render(<SelectField label="Urgencia" value={null} options={['Baja']} onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Seleccionar' })).toBeDisabled()
    expect(screen.getByLabelText('Urgencia')).toHaveValue('')
  })

  it('usa el placeholder recibido', () => {
    render(<SelectField label="Urgencia" value={null} options={['Baja']} placeholder="Elige una" onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'Elige una' })).toBeInTheDocument()
  })

  it('una vez elegido un valor ya no ofrece el placeholder', () => {
    render(<SelectField label="Urgencia" value="Baja" options={['Baja']} onChange={vi.fn()} />)
    expect(screen.queryByRole('option', { name: 'Seleccionar' })).not.toBeInTheDocument()
  })

  it('entrega el valor elegido con su tipo original, también un número', async () => {
    const onChange = vi.fn()
    render(<SelectField<number> label="Cantidad" value={1} options={[1, 2, 3]} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Cantidad'), '3')
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('con hideLabel la etiqueta es solo para lectores', () => {
    render(<SelectField label="Urgencia" value="Baja" options={['Baja']} onChange={vi.fn()} hideLabel />)
    expect(screen.getByText('Urgencia')).toHaveClass('sr-only')
  })

  it('deshabilitado no deja elegir', () => {
    render(<SelectField label="Urgencia" value="Baja" options={['Baja', 'Alta']} onChange={vi.fn()} disabled />)
    expect(screen.getByLabelText('Urgencia')).toBeDisabled()
  })

  it('con una lista vacía solo queda el placeholder', () => {
    render(<SelectField label="Urgencia" value={null} options={[]} onChange={vi.fn()} />)
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })
})
