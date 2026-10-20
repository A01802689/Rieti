import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utilities/utils'

describe('cn', () => {
  it('une clases y descarta valores falsos', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('resuelve conflictos de Tailwind y gana la última', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('acepta objetos y arreglos', () => {
    expect(cn({ a: true, b: false }, ['c'])).toBe('a c')
  })

  it('devuelve vacío sin argumentos', () => {
    expect(cn()).toBe('')
  })
})
