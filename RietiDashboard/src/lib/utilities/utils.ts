import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Joins class names and resolves Tailwind conflicts (the last one wins)
 *
 * @param inputs - Class names, conditions or objects
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}