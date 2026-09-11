import { useNavigate } from "react-router-dom";
import "../Estilos/Login.css";
import "../Estilos/PanIzq.css";
import "../Estilos/FormularioLogin.css";

export function P_Inicio() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="panel-izquierdo"></div>

      <div className="formulario-login">
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus credenciales para acceder al sistema.</p>

        <label>Correo electrónico</label>
        <input type="email" placeholder="ejemplo@correo.com" />

        <label>Contraseña</label>
        <input type="password" placeholder="********" />

        <button onClick={handleLogin}>Iniciar sesión</button>
      </div>
    </div>
  );
}

export default P_Inicio;
