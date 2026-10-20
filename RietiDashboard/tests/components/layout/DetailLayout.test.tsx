import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DetailLayout } from '@/components/layout/DetailLayout'
import { makeAdmin, makeAuth } from '../../helpers/auth'
import { renderApp } from '../../helpers/render'

const renderLayout = (props: Partial<React.ComponentProps<typeof DetailLayout>> = {}) =>
  renderApp(
    <DetailLayout loading={false} found notFound="Reporte no encontrado" {...props}>
      <p>Contenido</p>
    </DetailLayout>,
    { auth: makeAuth(makeAdmin()), route: '/reports/1' },
  )

describe('DetailLayout', () => {
  it('cargando muestra el spinner y no el contenido', () => {
    renderLayout({ loading: true })
    expect(screen.getByText('Cargando')).toBeInTheDocument()
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('encontrado muestra el contenido', () => {
    renderLayout()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('forbidden va antes que el error y que el contenido', () => {
    renderLayout({ forbidden: true, error: 'x' })
    expect(screen.getByText('No tienes permiso para ver esta información')).toBeInTheDocument()
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('un error muestra LoadError con reintento', async () => {
    const onRetry = vi.fn()
    const view = renderLayout({ error: 'No se pudo cargar', onRetry })
    await view.user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('no encontrado muestra el título y el botón Volver si hay backTo', async () => {
    const view = renderLayout({ found: false, backTo: '/reports' })
    expect(screen.getByRole('heading', { name: 'Reporte no encontrado' })).toBeInTheDocument()
    await view.user.click(screen.getByRole('button', { name: '← Volver' }))
    expect(view.path()).toBe('/reports')
  })

  it('no encontrado sin backTo no muestra Volver', () => {
    renderLayout({ found: false })
    expect(screen.queryByRole('button', { name: '← Volver' })).not.toBeInTheDocument()
  })

  it('siempre incluye el pie institucional', () => {
    renderLayout({ loading: true })
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
