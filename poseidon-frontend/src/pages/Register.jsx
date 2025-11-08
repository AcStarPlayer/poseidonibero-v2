import React, { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/register", form);
      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      }
      if (res.data.user) {
        setUser(res.data.user);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error en registro");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2>Registro</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <input name="name" value={form.name} onChange={onChange} placeholder="Nombre" className="form-control" required />
          </div>
          <div className="mb-2">
            <input name="email" value={form.email} onChange={onChange} placeholder="Email" className="form-control" required />
          </div>
          <div className="mb-2">
            <input name="password" value={form.password} onChange={onChange} placeholder="Contraseña" type="password" className="form-control" required />
          </div>
          <button className="btn btn-primary">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
