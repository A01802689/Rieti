import { useNavigate } from "react-router-dom";
import "../Estilos/Navbar.css";

interface NavbarProps {
  activo: "Dashboard" | "Mapas" | "Reportes" | "Usuarios";
}

export function Navbar({ activo }: NavbarProps) {
  const navigate = useNavigate();

  const rutas: Record<string, string> = {
    Dashboard: "/dashboard",
    Mapas: "/mapas",
    Reportes: "/reportes",
    Usuarios: "/usuarios",
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-logo">
        <div>
          <strong>Rieti</strong>
          <p>Atizapán de Zaragoza</p>
        </div>
      </div>

      <div className="navbar-links">
        {Object.keys(rutas).map((nombre) => (
          <span
            key={nombre}
            className={activo === nombre ? "activo" : ""}
            onClick={() => navigate(rutas[nombre])}
          >
            {nombre}
          </span>
        ))}
      </div>

      <div className="navbar-usuario">
        <div>
          <strong>Carlos Rodríguez Mejía</strong>
          <p>Administrador · Atizapán Norte</p>
        </div>
        <div className="avatar">CR</div>
      </div>
    </nav>
  );
}

export default Navbar;
