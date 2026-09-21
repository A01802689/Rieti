import { InfoCard } from "./InfoCard"
import { LoginCard } from "./LoginCard"

const Login = () => (
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
          <InfoCard digit={180} desc="Reportes registrados" />
          <InfoCard digit={37} desc="Casos activos" />
          <InfoCard digit={127} desc="Niños atendidos" />
        </div>
      </div>

    <div className="flex-3 bg-gray-100 dark:bg-gray-800 content-center">
      <LoginCard />
    </div>
    </div>
  )

export default Login