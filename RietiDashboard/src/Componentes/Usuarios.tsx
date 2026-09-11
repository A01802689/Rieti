import Navbar from "./Navbar";
import "../Estilos/Usuarios.css";

export function Usuarios() {
  return (
    <div className="usuarios-pagina">
      <Navbar activo="Usuarios" />

      <div className="usuarios-header-principal">
        <div>
          <h2>Usuarios</h2>
          <p>5 usuarios registrados</p>
        </div>

        <button className="btn-dar-alta">+ Dar de alta</button>
      </div>

      <div className="usuarios-contenido"></div>
    </div>
  );
}

export default Usuarios;
