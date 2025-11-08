import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      console.error("❌ Error en login:", err);
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: err.response?.data?.message || "Credenciales inválidas",
      });
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="card shadow p-4">
          <h2 className="text-center mb-3">Iniciar Sesión</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Correo electrónico"
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Contraseña"
                className="form-control"
                required
              />
            </div>
            <button className="btn btn-primary w-100">Iniciar sesión</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
