import { Navbar } from "./Navbar";
import seccionMapaImg from "../assets/SeccionMapa.png";
import "../Estilos/Mapas.css";

export function Mapas() {
  return (
    <div className="mapas-pagina">
      <Navbar activo="Mapas" />

      <div className="mapas-contenido">
        <aside className="mapas-sidebar">
          <h3>Filtros de mapa</h3>
          <p>Atizapán de Zaragoza, Edo. Méx.</p>

          <label className="filtro-label">TIPO DE ACTIVIDAD</label>
          <div className="filtro-checkbox">
            <label>
              <input type="checkbox" /> Ventas ambulantes
            </label>
            <label>
              <input type="checkbox" /> Construcción
            </label>
            <label>
              <input type="checkbox" /> Mendicidad
            </label>
            <label>
              <input type="checkbox" /> Trabajo doméstico
            </label>
            <label>
              <input type="checkbox" /> Trabajo en calle
            </label>
            <label>
              <input type="checkbox" /> Agricultura
            </label>
          </div>
          <label className="filtro-label">LEYENDA</label>
          <div className="leyenda">
            <span className="punto azul"></span> Baja concentración
            <br />
            <span className="punto amarillo"></span> Concentración media
            <br />
            <span className="punto rojo"></span> Alta concentración
          </div>
        </aside>

        <div className="mapas-imagen-contenedor">
          <img
            src={seccionMapaImg}
            alt="Mapa de reportes"
            className="mapa-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Mapas;
