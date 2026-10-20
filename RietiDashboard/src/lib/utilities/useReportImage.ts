import { useEffect, useState } from 'react'
import { getReportImage } from '@/lib/api/reports'

/**
 * Gets the link to see the photo of a report: it asks the API for the signed S3 link, since the dashboard cannot rely on the address the report carries
 *
 * @param id - Id of the report, null when the report has no photo
 * @returns `loading` while the link is asked and `url`, the link, or null when there is no photo or the API could not give it
 */
export function useReportImage(id: number | null) {
  // the answer is tied to the id it belongs to, so a new id starts loading again without an effect
  const [answer, setAnswer] = useState<{ id: number; url: string | null } | null>(null)

  useEffect(() => {
    if (id === null) return
    // an answer that arrives after the id changed or the page closed is dropped
    let ignore = false

    getReportImage(id)
      .then((links) => {
        if (!ignore) setAnswer({ id, url: links.url_visualizacion })
      })
      .catch((e) => {
        console.error(`Error fetching the photo of the report from api ${e}`)
        if (!ignore) setAnswer({ id, url: null })
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (id === null) return { loading: false, url: null }
  if (answer?.id !== id) return { loading: true, url: null }
  return { loading: false, url: answer.url }
}
