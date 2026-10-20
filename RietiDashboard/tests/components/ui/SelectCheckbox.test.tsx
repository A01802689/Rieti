import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectCheckbox } from '@/components/ui/SelectCheckbox'

describe('SelectCheckbox', () => {
  it('refleja si la tarjeta está elegida', () => {
    render(<SelectCheckbox label="Seleccionar REP-1" selection={{ selected: true, onToggle: vi.fn() }} />)
    expect(screen.getByRole('checkbox', { name: 'Seleccionar REP-1' })).toBeChecked()
  })

  it('el clic llama a onToggle', async () => {
    const onToggle = vi.fn()
    render(<SelectCheckbox label="Seleccionar REP-1" selection={{ selected: false, onToggle }} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('el clic no llega a la tarjeta que lo contiene', async () => {
    const onCardClick = vi.fn()
    render(
      <div onClick={onCardClick}>
        <SelectCheckbox label="x" selection={{ selected: false, onToggle: vi.fn() }} />
      </div>,
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCardClick).not.toHaveBeenCalled()
  })
})
