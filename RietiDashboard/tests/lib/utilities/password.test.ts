import { describe, expect, it } from 'vitest'
import { isValidPassword, PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REQUIREMENTS } from '@/lib/utilities/password'

const metBy = (value: string) => PASSWORD_REQUIREMENTS.map((requirement) => requirement.test(value))

describe('isValidPassword', () => {
  it('acepta una contraseña con todas las reglas', () => {
    expect(isValidPassword('Abcdef1!')).toBe(true)
  })

  it('acepta exactamente 8 caracteres', () => {
    expect('Abcde1!x').toHaveLength(PASSWORD_MIN_LENGTH)
    expect(isValidPassword('Abcde1!x')).toBe(true)
  })

  it('rechaza 7 caracteres aunque cumpla lo demás', () => {
    expect(isValidPassword('Abcd1!x')).toBe(false)
  })

  it('rechaza si falta la mayúscula', () => {
    expect(isValidPassword('abcdef1!')).toBe(false)
  })

  it('rechaza si falta el número', () => {
    expect(isValidPassword('Abcdefg!')).toBe(false)
  })

  it('rechaza si falta el carácter especial', () => {
    expect(isValidPassword('Abcdefg1')).toBe(false)
  })

  it('rechaza una cadena vacía', () => {
    expect(isValidPassword('')).toBe(false)
  })

  it('cuenta el espacio como carácter especial', () => {
    expect(isValidPassword('Abcdefg 1')).toBe(true)
  })

  it('cuenta una letra con acento como carácter especial', () => {
    expect(isValidPassword('Abcdefgé1')).toBe(true)
  })

  it('una mayúscula con acento no cuenta como mayúscula', () => {
    expect(isValidPassword('ébcdefg1!')).toBe(false)
  })

  it('acepta contraseñas largas', () => {
    expect(isValidPassword(`A1!${'x'.repeat(200)}`)).toBe(true)
  })

  it('la regex y los requisitos dan el mismo resultado', () => {
    const samples = ['', 'Abcdef1!', 'abcdef1!', 'Abcdefg!', 'Abcdefg1', 'Ab1!', 'ÁÉÍÓÚ12 34', 'Abcdefg 1', 'Abcdefgé1']
    for (const sample of samples) {
      expect(PASSWORD_REGEX.test(sample)).toBe(metBy(sample).every(Boolean))
    }
  })
})

describe('PASSWORD_REQUIREMENTS', () => {
  it('tiene cuatro reglas con su texto', () => {
    expect(PASSWORD_REQUIREMENTS.map((r) => r.label)).toEqual([
      'Mínimo 8 caracteres',
      'Al menos una mayúscula',
      'Al menos un número',
      'Al menos un carácter especial',
    ])
  })

  it('cada regla ausente se detecta por separado', () => {
    expect(metBy('Abcde1!')).toEqual([false, true, true, true])
    expect(metBy('abcdef1!')).toEqual([true, false, true, true])
    expect(metBy('Abcdefg!')).toEqual([true, true, false, true])
    expect(metBy('Abcdefg1')).toEqual([true, true, true, false])
  })

  it('ninguna regla se cumple con una cadena vacía', () => {
    expect(metBy('')).toEqual([false, false, false, false])
  })
})
