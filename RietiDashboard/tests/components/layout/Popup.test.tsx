import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Popup } from '@/components/layout/Popup'

describe('Popup', () => {
  it('cerrado no muestra nada', () => {
    render(<Popup open={false} onClose={vi.fn()} title="Título"><p>Cuerpo</p></Popup>)
    expect(screen.queryByText('Cuerpo')).not.toBeInTheDocument()
  })

  it('abierto muestra título, descripción y contenido', () => {
    render(<Popup open onClose={vi.fn()} title="Título" description="Detalle"><p>Cuerpo</p></Popup>)
    expect(screen.getByRole('dialog', { name: 'Título' })).toBeInTheDocument()
    expect(screen.getByText('Detalle')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
  })

  it('sin título no pinta el encabezado ni el botón de cerrar', () => {
    render(<Popup open onClose={vi.fn()}><p>Cuerpo</p></Popup>)
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()
  })

  it('sin descripción solo muestra el título', () => {
    render(<Popup open onClose={vi.fn()} title="Título"><p>Cuerpo</p></Popup>)
    expect(screen.queryByText('Detalle')).not.toBeInTheDocument()
  })

  it('el botón Cerrar llama a onClose', async () => {
    const onClose = vi.fn()
    render(<Popup open onClose={onClose} title="Título"><p>Cuerpo</p></Popup>)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape llama a onClose', async () => {
    const onClose = vi.fn()
    render(<Popup open onClose={onClose} title="Título"><p>Cuerpo</p></Popup>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('un clic dentro del contenido no lo cierra', async () => {
    const onClose = vi.fn()
    render(<Popup open onClose={onClose} title="Título"><button>Dentro</button></Popup>)
    await userEvent.click(screen.getByRole('button', { name: 'Dentro' }))
    expect(onClose).not.toHaveBeenCalled()
  })
})
