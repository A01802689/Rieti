import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { StatusChart } from '@/components/ui/StatusChart'
import LineGraph from '@/pages/home/components/LineGraph'
import InfoKpi from '@/pages/home/components/InfoKpi'
import { mockMatchMedia } from '../../helpers/media'

type Datum = { name: string; total?: number; value?: number }

// recharts needs real sizes that jsdom does not have, so the charts are replaced by plain elements that show their data
vi.mock('recharts', () => {
  const passData = (children: ReactNode, data: Datum[]) =>
    Children.map(children, (child) => (isValidElement(child) ? cloneElement(child as ReactElement<{ data?: Datum[] }>, { data }) : child))
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    BarChart: ({ data, children }: { data: Datum[]; children: ReactNode }) => <div data-testid="bars">{passData(children, data)}</div>,
    LineChart: ({ data, children }: { data: Datum[]; children: ReactNode }) => <div data-testid="line">{passData(children, data)}</div>,
    Bar: ({ data = [], children, onClick }: { data?: Datum[]; children?: ReactNode; onClick?: (d: Datum) => void }) => (
      <div>
        {data.map((d) => (
          <button key={d.name} onClick={() => onClick?.(d)}>
            {d.name}:{d.total}
          </button>
        ))}
        {Children.map(children, (cell) => cell)}
      </div>
    ),
    Cell: ({ fill, fillOpacity }: { fill: string; fillOpacity: number }) => <i data-fill={fill} data-opacity={fillOpacity} />,
    Line: ({ data = [] }: { data?: Datum[] }) => <ul>{data.map((d) => <li key={d.name}>{d.name}={d.value}</li>)}</ul>,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  }
})

const options = [
  { value: 'Todos', total: 6 },
  { value: 'Recibido', total: 4 },
  { value: 'Rechazado', total: 2 },
  { value: 'Inventado', total: 0 },
]

describe('StatusChart', () => {
  it('muestra el título y una barra por opción, sin la opción de todos', () => {
    render(<StatusChart title="Reportes por estatus" options={options} allValue="Todos" />)
    expect(screen.getByRole('region', { name: 'Reportes por estatus' })).toBeInTheDocument()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Recibido:4', 'Rechazado:2', 'Inventado:0'])
  })

  it('las barras de un estatus conocido usan su color y las demás el gris', () => {
    const { container } = render(<StatusChart title="x" options={options} allValue="Todos" />)
    const fills = [...container.querySelectorAll('i')].map((i) => i.getAttribute('data-fill'))
    expect(fills).toEqual(['#f97316', '#ef4444', '#9ca3af'])
  })

  it('sin selección todas las barras van completas', () => {
    const { container } = render(<StatusChart title="x" options={options} allValue="Todos" />)
    expect([...container.querySelectorAll('i')].map((i) => i.getAttribute('data-opacity'))).toEqual(['1', '1', '1'])
  })

  it('con una selección atenúa las demás barras', () => {
    const { container } = render(<StatusChart title="x" options={options} allValue="Todos" selected="Recibido" />)
    expect([...container.querySelectorAll('i')].map((i) => i.getAttribute('data-opacity'))).toEqual(['1', '0.35', '0.35'])
  })

  it('el clic en una barra llama a onSelect con su nombre', async () => {
    const onSelect = vi.fn()
    render(<StatusChart title="x" options={options} allValue="Todos" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: 'Rechazado:2' }))
    expect(onSelect).toHaveBeenCalledWith('Rechazado')
  })

  it('sin onSelect el clic no falla', async () => {
    render(<StatusChart title="x" options={options} allValue="Todos" />)
    await userEvent.click(screen.getByRole('button', { name: 'Recibido:4' }))
  })

  it('funciona en modo oscuro', () => {
    mockMatchMedia(true)
    render(<StatusChart title="x" options={options} allValue="Todos" className="mt-3" />)
    expect(screen.getByRole('region')).toHaveClass('mt-3')
  })

  it('con solo la opción de todos no dibuja barras', () => {
    render(<StatusChart title="x" options={[{ value: 'Todos', total: 0 }]} allValue="Todos" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('LineGraph', () => {
  it('dibuja el título y los puntos', () => {
    render(<LineGraph data={[{ name: 'Enero', value: 1 }, { name: 'Febrero', value: 0 }]} />)
    expect(screen.getByRole('heading', { name: 'Casos registrados' })).toBeInTheDocument()
    expect(screen.getByText('Enero=1')).toBeInTheDocument()
    expect(screen.getByText('Febrero=0')).toBeInTheDocument()
  })

  it('funciona en modo oscuro y sin datos', () => {
    mockMatchMedia(true)
    render(<LineGraph data={[]} />)
    expect(screen.getByTestId('line')).toBeInTheDocument()
  })
})

describe('InfoKpi', () => {
  it('muestra el valor, la etiqueta y la nota', () => {
    render(<InfoKpi label="Casos" value="12" note="registrados" tone="bg-amber-500" />)
    expect(screen.getByRole('heading', { name: '12' })).toBeInTheDocument()
    expect(screen.getByText('Casos')).toBeInTheDocument()
    expect(screen.getByText('registrados')).toBeInTheDocument()
  })
})
