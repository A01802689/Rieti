import { describe, expect, it } from 'vitest'
import { ALL_OPTION } from '@/lib/utilities/filters'

describe('ALL_OPTION', () => {
  it('es la opción que muestra todo', () => {
    expect(ALL_OPTION).toBe('Todos')
  })
})
