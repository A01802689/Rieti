import HeatMap from "@/components/ui/HeatMap"
import Loading from "@/components/ui/Loading"
// import { Popup } from "react-map-gl/maplibre"

import { useHeatMap } from "./useHeatMap"
import { DragableMenu } from "../../components/layout/DragableMenu"
import { Filters } from "./components/Filters"
import { SelectionCard } from "./components/SelectionCard"


const HeatMapPage = () => {
  const state = useHeatMap()

  // hide the card when its layer is turned off
  const { selected } = state
  const visibleSelected = selected && (selected.type === "report" ? state.showReports : state.showCases)
    ? selected
    : null

  return(
    // the map fills the screen and the rest floats over it
    <div className="relative h-screen w-screen">
      <div className="h-full w-full">
      { state.loading ? 
        <Loading />
      :
        <HeatMap
          reportsArr={state.reports}
          casesArr={state.cases}
          showReports={state.showReports}
          showCases={state.showCases}
          reportVisual={state.reportVisual}
          caseVisual={state.caseVisual}
          selected={state.selected}
          setSelected={state.setSelected}
          // keep the legend above the closed menu on mobile
          legendClassName="bottom-20 left-4 md:bottom-4"
        />
      }
      </div>

      {!state.loading && (
        // show the selected report or case
        <div className="absolute left-4 top-4 z-10">
          <SelectionCard selected={visibleSelected} reports={state.allReports} cases={state.allCases} onClose={() => state.setSelected(null)} />
        </div>
      )}

      <DragableMenu>
        <Filters state={state} />
      </DragableMenu>
    </div>
  )
}

export default HeatMapPage
