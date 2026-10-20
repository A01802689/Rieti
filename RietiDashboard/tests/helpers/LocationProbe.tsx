import { useLocation } from 'react-router-dom'

/** Shows the current path so a test can read where the router went */
export function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}
