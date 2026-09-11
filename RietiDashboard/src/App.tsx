import { P_Inicio } from "./Componentes/P_Inicio";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Componentes/Dashboard";

import Mapas from "./Componentes/Mapas";
import Reportes from "./Componentes/Reportes";

import Usuarios from "./Componentes/Usuarios";

function App() {
  return (
    <Routes>
      <Route path="/" element={<P_Inicio />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mapas" element={<Mapas />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/usuarios" element={<Usuarios />} />
    </Routes>
  );
}

export default App;
