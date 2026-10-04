import HeatMap from "@/components/ui/HeatMap"
import { useState } from "react"
import {  } from "./useHeatMap"


const HeatMapPage = () => {
  const [selecedId, setSelecedId] = useState<string | null>(null)
  return(
    <div className="h-screen v-screen">
      <HeatMap selectedReportId={selecedId} setSelectedReportId={setSelecedId} />
    </div>
  )
}

export default HeatMapPage