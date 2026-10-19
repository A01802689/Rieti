/** Minimum length of a password */
export const PASSWORD_MIN_LENGTH = 8

/** Password rule: at least 8 characters with an uppercase letter, a number and a special character */
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

/** Parts of the password rule, each with its own test so a form can show which ones are met */
export const PASSWORD_REQUIREMENTS: { label: string; test: (value: string) => boolean }[] = [
  { label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`, test: (value) => value.length >= PASSWORD_MIN_LENGTH },
  { label: 'Al menos una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { label: 'Al menos un número', test: (value) => /\d/.test(value) },
  { label: 'Al menos un carácter especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

/**
 * Tells if a password follows the rule: 8 characters or more with an uppercase letter, a number and a special character
 *
 * @param value - Password to check
 * @returns True when it meets every requirement
 */
export const isValidPassword = (value: string) => PASSWORD_REGEX.test(value)
