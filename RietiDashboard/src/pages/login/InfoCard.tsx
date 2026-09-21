interface Info {
  digit: number
  desc: string
}

export const InfoCard = ( {digit, desc}: Info ) => (
  <div className="bg-bluerelative rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 shadow-xl m-2 aspect-auto content-center flex-1">
    <h1 className="text-2xl py-0 text-white/80">{digit}</h1>
    <p className="text-sm text-white/80">{desc}</p>
  </div>
)