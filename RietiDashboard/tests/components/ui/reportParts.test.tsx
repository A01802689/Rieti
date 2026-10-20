import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { getReportImage } from '@/lib/api/reports'
import { LocationMap } from '@/components/ui/LocationMap'
import { ReportDetails } from '@/components/ui/ReportDetails'
import { ReportImage } from '@/components/ui/ReportImage'
import { makeReport } from '../../helpers/fixtures'

vi.mock('@/lib/api/reports', () => ({ getReportImage: vi.fn() }))

describe('LocationMap', () => {
  it('dibuja el mapa con un marcador en coordenadas válidas', () => {
    render(<LocationMap lat={19.5} lng={-99.2} />)
    expect(screen.getByTestId('marker')).toHaveTextContent('19.5,-99.2')
  })

  it.each([
    ['null', null, null],
    ['undefined', undefined, undefined],
    ['fuera de rango', 95, 0],
    ['NaN', NaN, 0],
  ])('con coordenadas %s muestra "Ubicación no disponible"', (_n, lat, lng) => {
    render(<LocationMap lat={lat} lng={lng} />)
    expect(screen.getByText('Ubicación no disponible')).toBeInTheDocument()
    expect(screen.queryByTestId('map')).not.toBeInTheDocument()
  })

  it('acepta una clase propia para el contenedor', () => {
    const { container } = render(<LocationMap lat={0} lng={0} className="h-24" />)
    expect(container.firstChild).toHaveClass('h-24')
  })
})

describe('ReportImage', () => {
  const links = (id: number) => ({ url_visualizacion: `https://s3.test/foto-${id}.jpg`, url_descarga: `https://s3.test/descarga-${id}.jpg`, expira_en: 300 })

  beforeEach(() => {
    vi.mocked(getReportImage).mockReset()
    vi.mocked(getReportImage).mockImplementation(async (id) => links(id))
  })

  it('sin reporte con foto muestra "Sin imagen" y no pide nada a la API', () => {
    render(<ReportImage reportId={null} alt="Foto" />)
    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
    expect(getReportImage).not.toHaveBeenCalled()
  })

  it('pide el enlace firmado a la API y carga la foto desde él', async () => {
    render(<ReportImage reportId={7} alt="Foto" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const image = await screen.findByRole('img', { name: 'Foto' })
    expect(getReportImage).toHaveBeenCalledWith(7)
    expect(image).toHaveAttribute('src', 'https://s3.test/foto-7.jpg')
  })

  it('muestra un spinner hasta que la foto carga', async () => {
    render(<ReportImage reportId={7} alt="Foto" />)
    const image = await screen.findByRole('img', { name: 'Foto' })
    expect(image).toHaveClass('opacity-0')
    expect(screen.getByRole('status')).toBeInTheDocument()
    fireEvent.load(image)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(image).not.toHaveClass('opacity-0')
  })

  it('si la API no da el enlace (sin foto, 404 o 502) muestra "Sin imagen"', async () => {
    vi.mocked(getReportImage).mockRejectedValue(new ApiError(404, 'La imagen todavía no está disponible'))
    render(<ReportImage reportId={7} alt="Foto" />)
    expect(await screen.findByText('Sin imagen')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('si falla la carga de la foto muestra "Sin imagen"', async () => {
    render(<ReportImage reportId={7} alt="Foto" />)
    fireEvent.error(await screen.findByRole('img'))
    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
  })

  it('un reporte nuevo pide su propio enlace y vuelve a intentar tras un fallo', async () => {
    const { rerender } = render(<ReportImage reportId={1} alt="Foto" />)
    fireEvent.error(await screen.findByRole('img'))
    rerender(<ReportImage reportId={2} alt="Foto" />)
    expect(await screen.findByRole('img')).toHaveAttribute('src', 'https://s3.test/foto-2.jpg')
    expect(getReportImage).toHaveBeenCalledWith(2)
  })

  it('una respuesta tardía de un reporte anterior no pisa a la del actual', async () => {
    let soltar: (v: ReturnType<typeof links>) => void = () => undefined
    vi.mocked(getReportImage).mockImplementationOnce(() => new Promise((resolve) => { soltar = resolve }))
    const { rerender } = render(<ReportImage reportId={1} alt="Foto" />)
    rerender(<ReportImage reportId={2} alt="Foto" />)
    expect(await screen.findByRole('img')).toHaveAttribute('src', 'https://s3.test/foto-2.jpg')
    soltar(links(1))
    await Promise.resolve()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://s3.test/foto-2.jpg')
  })

  it('el enlace abre la foto firmada en otra pestaña', async () => {
    render(<ReportImage reportId={7} alt="Foto" />)
    await screen.findByRole('img')
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('href', 'https://s3.test/foto-7.jpg')
  })
})

describe('ReportDetails', () => {
  it('muestra los datos de un reporte completo', () => {
    render(<ReportDetails report={makeReport({ id_caso: 7, referencia: undefined } as never)} />)
    expect(screen.getByText('Usuario #5')).toBeInTheDocument()
    expect(screen.getByText('Venta ambulante')).toBeInTheDocument()
    expect(screen.getByText('Medio')).toBeInTheDocument()
    expect(screen.getByText('2 menores, 6-11 años')).toBeInTheDocument()
    expect(screen.getByText('#7')).toBeInTheDocument()
    expect(screen.getByText('Calle 1, Centro, Atizapán de Zaragoza')).toBeInTheDocument()
    expect(screen.getByText('Niño vendiendo dulces')).toBeInTheDocument()
    expect(screen.getByText(/05.*mar.*2026/i)).toBeInTheDocument()
  })

  it('un reporte anónimo y sin datos muestra "Sin dato"', () => {
    const base = makeReport()
    render(
      <ReportDetails
        report={makeReport({
          id_usuario: null,
          tipo_trabajo: 'Desconocido' as never,
          riesgo: null,
          descripcion: null,
          cantidad_nna: null as never,
          edad_aproximada: null,
          ubicacion: { ...base.ubicacion, calle: '', colonia: '', municipio: '' },
        })}
      />,
    )
    expect(screen.getByText('Reporte anónimo')).toBeInTheDocument()
    expect(screen.getAllByText('Sin dato')).toHaveLength(3)
    expect(screen.getByText('Cantidad sin dato, Edad sin dato')).toBeInTheDocument()
    expect(screen.getByText('Sin caso')).toBeInTheDocument()
    expect(screen.getByText('Sin descripción')).toBeInTheDocument()
  })

  it('muestra la referencia solo si existe', () => {
    const base = makeReport()
    const { rerender } = render(<ReportDetails report={makeReport({ ubicacion: { ...base.ubicacion, referencia: 'Frente a la tienda' } })} />)
    expect(screen.getByText('Referencia: Frente a la tienda')).toBeInTheDocument()
    rerender(<ReportDetails report={makeReport({ ubicacion: { ...base.ubicacion, referencia: null } })} />)
    expect(screen.queryByText(/Referencia/)).not.toBeInTheDocument()
  })

  it('withMap false no dibuja el mapa', () => {
    render(<ReportDetails report={makeReport()} withMap={false} />)
    expect(screen.queryByTestId('map')).not.toBeInTheDocument()
  })

  it('por defecto dibuja el mapa, o la tarjeta si la ubicación es inválida', () => {
    const base = makeReport()
    const { rerender } = render(<ReportDetails report={makeReport()} />)
    expect(screen.getByTestId('map')).toBeInTheDocument()
    rerender(<ReportDetails report={makeReport({ ubicacion: { ...base.ubicacion, lat: 500 } })} />)
    expect(screen.getByText('Ubicación no disponible')).toBeInTheDocument()
  })
})
