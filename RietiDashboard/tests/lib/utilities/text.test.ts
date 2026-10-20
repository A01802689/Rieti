import { describe, expect, it } from 'vitest'
import { normalizeText } from '@/lib/utilities/text'

describe('normalizeText', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizeText('ÁRBOL Canción ÑANDÚ')).toBe('arbol cancion nandu')
  })

  it('trata null y undefined como texto vacío', () => {
    expect(normalizeText(null)).toBe('')
    expect(normalizeText(undefined)).toBe('')
  })

  it('deja igual un texto sin acentos', () => {
    expect(normalizeText('hola mundo 123')).toBe('hola mundo 123')
  })

  it('normaliza letras ya descompuestas', () => {
    expect(normalizeText('é')).toBe('e')
  })

  it('no recorta espacios', () => {
    expect(normalizeText('  Hola ')).toBe('  hola ')
  })

  it('devuelve vacío con cadena vacía', () => {
    expect(normalizeText('')).toBe('')
  })
})
