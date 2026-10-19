import { useEffect, useState } from 'react'
import { getLoginIndicators } from '@/lib/api/indicators'
import type { LoginIndicators } from '@/lib/types/Indicators'

/**
 * View model of the totals shown on the login page: loads them once and keeps null while they are not available
 *
 * @returns The totals, or null while loading or if the request failed, so the page shows a dash and not a made up number
 */
export function useLoginIndicators() {
  const [indicators, setIndicators] = useState<LoginIndicators | null>(null)

  useEffect(() => {
    // an answer that arrives after the page closed is dropped
    let ignore = false

    const getData = async () => {
      try {
        const result = await getLoginIndicators()
        if (!ignore) setIndicators(result)
      } catch (e) {
        console.error(`Error fetching the login indicators from api ${e}`)
      }
    }

    getData()
    return () => {
      ignore = true
    }
  }, [])

  return indicators
}
