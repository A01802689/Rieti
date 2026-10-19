import type { LoginIndicators } from "../types/Indicators"
import { api } from "./client"

/**
 * Fetches the totals of the login page; it needs no session
 *
 * @returns The number of reports, active cases and children attended
 */
export const getLoginIndicators = () => api<LoginIndicators>("/indicadores/login")
