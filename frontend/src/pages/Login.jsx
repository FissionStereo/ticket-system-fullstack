import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
    const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
        email,
        password,
        }
    );

    console.log(response.data);
    localStorage.setItem("token", response.data.token);
    navigate("/dashboard");
    alert("Login exitoso");

    } catch (error) {
    console.log(error.response.data);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Sistema de Tickets TI</h1>
        <p>Inicia sesión para continuar</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;