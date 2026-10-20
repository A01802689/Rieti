import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { AuthContextType } from '@/context/auth'
import { AuthTestProvider } from './AuthTestProvider'
import { LocationProbe } from './LocationProbe'

/** Options of renderApp */
interface RenderAppOptions {
  /** Session the components read; without it there is no provider */
  auth?: AuthContextType
  /** Path where the router starts */
  route?: string
}

/**
 * Renders a component inside a memory router and, when asked, a controlled session
 *
 * @param ui - Component under test
 * @param options - Session and starting path
 * @returns What render gives, plus a user-event instance
 */
export function renderApp(ui: ReactElement, { auth, route = '/' }: RenderAppOptions = {}) {
  const content = auth ? <AuthTestProvider value={auth}>{ui}</AuthTestProvider> : ui
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter initialEntries={[route]}>
      {content}
      <LocationProbe />
    </MemoryRouter>,
  )
  return { user, ...result, path: () => result.getByTestId('location').textContent }
}
