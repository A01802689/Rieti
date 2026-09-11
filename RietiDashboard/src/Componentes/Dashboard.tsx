import Navbar from "./Navbar";
import mapaImg from "../assets/Mapa.png";
import "../Estilos/Dashboard.css";

export function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar activo="Dashboard" />

      <div className="dashboard-stats"></div>
      <div className="dashboard-graficas">
        <div className="panel-grafica">
          <h3>Tendencia mensual</h3>
          <p>Reportes recibidos · Atizapán de Zaragoza</p>
        </div>

        <div className="panel-mapa">
          <h3>Mapa de calor</h3>
          <p>Concentración de reportes · Atizapán de Zaragoza, Edo. Méx.</p>
          <img src={mapaImg} alt="Mapa de calor" className="mapa-imagen" />
        </div>
      </div>

      <div className="panel-reportes-recientes">
        <div className="reportes-header">
          <div>
            <h3>Reportes recientes</h3>
            <p>Últimas entradas registradas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
