import { InfoCard } from "./components/InfoCard"
import { LoginCard } from "./components/LoginCard"
import { useLoginIndicators } from "./useLoginIndicators"

/** Login page: presentation panel with the totals of the system next to the sign-in card */
const Login = () => {
  const indicators = useLoginIndicators()

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen ">
      <div className="flex-2 flex flex-col bg-blue-600 dark:bg-[#1d4ed8] justify-between p-2">
        
        <div className="flex flex-col justify-evenly">
          <div>
            <h2 className="text-gray-200 font-bold tracking-wide">RIETI</h2>
            <p className="font-sight text-gray-400">Sistema de vigilancia</p>
          </div>

          <div>
            <h1 className="text-gray-100">Protegiendo a la niñez de Atizapán de Zaragoza</h1>
            <p className="font-sight text-gray-400">Plataforma de gestión de reportes de trabajo infantil. Acceso exclusivo para personal autorizado.</p>
          </div>
        </div>

        <div className="flex flex-row justify-evenly">
          <InfoCard digit={indicators?.reportes_registrados ?? null} desc="Reportes registrados" />
          <InfoCard digit={indicators?.casos_activos ?? null} desc="Casos activos" />
          <InfoCard digit={indicators?.ninos_atendidos ?? null} desc="Niños atendidos" />
        </div>
      </div>

    <div className="flex-3 bg-panel content-center">
      <LoginCard />
    </div>
    </div>
  )
}

export default Login