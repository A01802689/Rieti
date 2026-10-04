import HeatMap from "@/components/ui/HeatMap"
import { useState } from "react"
import {  } from "./useHeatMap"

import { DragableMenu } from "./components/DragableMenu"


const HeatMapPage = () => {
  const [selecedId, setSelecedId] = useState<string | null>(null)
  return(
    // the map fills the screen and DragableMenu (position: fixed) floats over it at the bottom
    <div className="relative h-screen w-screen">
      <div className="h-full w-full">
        <HeatMap selectedReportId={selecedId} setSelectedReportId={setSelecedId} />
      </div>

      <DragableMenu>
        {selecedId
          ? <p>Reporte seleccionado: {selecedId}</p>
          : <p className="font-sight">Selecciona un reporte en el mapa</p>
        }
      </DragableMenu>
    </div>
  )
}

export default HeatMapPage
