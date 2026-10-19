import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// MapLibre looks for its worker next to the bundled script, a file the production build does not copy,
// so the worker is bundled with Vite and its address is given to MapLibre explicitly
setWorkerUrl(workerUrl)
