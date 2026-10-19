/** Result of deleting several reports (DELETE /reportes) or cases (DELETE /casos) at once */
export interface BatchDeleteResult {
  /** Ids that were deleted */
  eliminados: number[]
  /** Ids that were skipped: they do not exist or are not allowed to be deleted (reports not rejected, cases not closed) */
  omitidos: number[]
}
