/**
 * Lowercases a text and removes its accents for searching
 *
 * @param text - Text to normalize; null and undefined count as empty
 * @returns The normalized text
 */
export const normalizeText = (text: string | null | undefined) =>
  (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
