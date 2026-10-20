import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SearchInput from '@/components/ui/SearchInput'

describe('SearchInput', () => {
  it('muestra el valor, el nombre accesible y el placeholder', () => {
    render(<SearchInput value="ana" onChange={vi.fn()} label="Buscar usuarios" placeholder="Buscar..." />)
    const input = screen.getByRole('searchbox', { name: 'Buscar usuarios' })
    expect(input).toHaveValue('ana')
    expect(input).toHaveAttribute('placeholder', 'Buscar...')
  })

  it('onChange recibe el texto en cada tecla', async () => {
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} label="Buscar" />)
    await userEvent.type(screen.getByRole('searchbox'), 'ab')
    expect(onChange.mock.calls).toEqual([['a'], ['b']])
  })

  it('Enter llama a onSearch con el valor actual', async () => {
    const onSearch = vi.fn()
    render(<SearchInput value="calle" onChange={vi.fn()} onSearch={onSearch} label="Buscar" />)
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}')
    expect(onSearch).toHaveBeenCalledWith('calle')
  })

  it('otra tecla no busca', async () => {
    const onSearch = vi.fn()
    render(<SearchInput value="" onChange={vi.fn()} onSearch={onSearch} label="Buscar" />)
    await userEvent.type(screen.getByRole('searchbox'), 'a')
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('Enter sin onSearch no falla', async () => {
    render(<SearchInput value="" onChange={vi.fn()} label="Buscar" />)
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}')
  })

  it('el clic en el ícono busca solo si hay onSearch', async () => {
    const onSearch = vi.fn()
    const { container, rerender } = render(<SearchInput value="x" onChange={vi.fn()} onSearch={onSearch} label="Buscar" />)
    await userEvent.click(container.querySelector('svg')!)
    expect(onSearch).toHaveBeenCalledWith('x')
    rerender(<SearchInput value="x" onChange={vi.fn()} label="Buscar" />)
    await userEvent.click(container.querySelector('svg')!)
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('aplica la clase del contenedor', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} label="Buscar" className="flex-1" />)
    expect(container.firstChild).toHaveClass('flex-1')
  })
})
