import HeatMap from "@/components/ui/HeatMap"
import Loading from "@/components/ui/Loading"
import { Forbidden } from "@/components/ui/Forbidden"
// import { Popup } from "react-map-gl/maplibre"

import { useHeatMap } from "./useHeatMap"
import { DragableMenu } from "./components/DragableMenu"
import { Filters } from "./components/Filters"
import { SelectionCard } from "./components/SelectionCard"
import SideBar from "@/components/ui/SideBar"


/** Map page: heat map with the filter menu, the selection card and the color legend */
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
        <div className="md:fixed md:left-0 md:top-0 md:z-10 md:h-screen md:w-60 md:p-4">
                        <SideBar />
                    </div>
      { state.loading ? 
        <Loading />
      : state.forbidden ?
        <div className="flex h-full items-center justify-center p-4 md:pl-64">
          <Forbidden className="max-w-sm py-10" />
        </div>
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

      {!state.loading && !state.forbidden && (
        <div className="absolute left-4 top-4 z-10">
          <SelectionCard selected={visibleSelected} reports={state.allReports} cases={state.allCases} onClose={() => state.setSelected(null)} />
        </div>
      )}

      {!state.forbidden && (
        <DragableMenu>
          <Filters state={state} />
        </DragableMenu>
      )}
    </div>
  )
}

export default HeatMapPage
