import { Spinner } from "./Spinner";
/** Spinner with the text "Cargando", used while data is being loaded */
const Loading = () => (
  <>
    <div className="flex flex-row flex-center bg-page h-full w-full">
      <Spinner className="font-accent" />
      <p className="font-medium">Cargando</p>
    </div>
  </>
)

export default Loading