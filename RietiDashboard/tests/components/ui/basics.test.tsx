import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Ban, Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Forbidden } from '@/components/ui/Forbidden'
import { LoadError } from '@/components/ui/LoadError'
import Loading from '@/components/ui/Loading'
import { Spinner } from '@/components/ui/Spinner'
import { Unavailable } from '@/components/ui/Unavailable'
import { InfoCard } from '@/pages/login/components/InfoCard'
import { Footer } from '@/components/layout/Footer'

describe('Forbidden', () => {
  it('avisa que no hay permiso', () => {
    render(<Forbidden />)
    expect(screen.getByText('No tienes permiso para ver esta información')).toBeInTheDocument()
  })

  it('aplica la clase recibida a la tarjeta', () => {
    const { container } = render(<Forbidden className="py-10" />)
    expect(container.firstChild).toHaveClass('py-10')
  })
})

describe('LoadError', () => {
  it('muestra el mensaje como alerta', () => {
    render(<LoadError message="No se pudieron cargar los reportes" />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los reportes')
  })

  it('sin onRetry no hay botón', () => {
    render(<LoadError message="Error" />)
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })

  it('el clic en Reintentar llama a onRetry', async () => {
    const onRetry = vi.fn()
    render(<LoadError message="Error" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('Unavailable', () => {
  it('muestra el mensaje con el ícono por defecto oculto a lectores', () => {
    const { container } = render(<Unavailable message="Sin imagen" />)
    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('usa el ícono recibido', () => {
    const { container: withBan } = render(<Unavailable message="a" icon={Ban} />)
    const { container: withSearch } = render(<Unavailable message="b" icon={Search} />)
    expect(withBan.querySelector('svg')?.getAttribute('class')).toContain('lucide-ban')
    expect(withSearch.querySelector('svg')?.getAttribute('class')).toContain('lucide-search')
  })

  it('mezcla la clase recibida con la base', () => {
    const { container } = render(<Unavailable message="a" className="h-52" />)
    expect(container.firstChild).toHaveClass('h-52', 'flex')
  })
})

describe('Spinner y Loading', () => {
  it('Spinner es un estado con nombre accesible', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('Spinner acepta clases y atributos', () => {
    render(<Spinner className="size-4" data-extra="x" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('size-4', 'animate-spin')
    expect(spinner).toHaveAttribute('data-extra', 'x')
  })

  it('Loading muestra el texto Cargando y el spinner', () => {
    render(<Loading />)
    expect(screen.getByText('Cargando')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('InfoCard', () => {
  it('muestra el número y la descripción', () => {
    render(<InfoCard digit={42} desc="Reportes registrados" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('42')
    expect(screen.getByText('Reportes registrados')).toBeInTheDocument()
  })

  it('null muestra una raya', () => {
    render(<InfoCard digit={null} desc="Casos activos" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('—')
  })

  it('el cero es un dato real y no se cambia por la raya', () => {
    render(<InfoCard digit={0} desc="Niños atendidos" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('0')
  })
})

describe('Footer', () => {
  it('muestra el aviso institucional', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Gobierno Municipal de Atizapán de Zaragoza.')
    expect(screen.getByText('Todos los derechos reservados.')).toBeInTheDocument()
  })
})
