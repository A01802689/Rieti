import { useState } from "react";
import Navbar from "./Navbar";
import "../Estilos/Reportes.css";

const filtros = ["Todos", "Abierto", "En Proceso", "Cerrado"];

export function Reportes() {
  const [filtroActivo, setFiltroActivo] = useState("Todos");

  return (
    <div className="reportes-pagina">
      <Navbar activo="Reportes" />

      <div className="reportes-header-principal">
        <div>
          <h2>Reportes</h2>
          <p>Gestión y seguimiento de casos · Atizapán de Zaragoza</p>
        </div>

        <div className="reportes-filtros">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              className={filtroActivo === filtro ? "filtro-activo" : ""}
              onClick={() => setFiltroActivo(filtro)}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      <div className="reportes-contenido"></div>
    </div>
  );
}

export default Reportes;
