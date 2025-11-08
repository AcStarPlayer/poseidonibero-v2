import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // 🧩 Verificar token almacenado al cargar la app
  useEffect(() => {
    const verifyUser = async () => {
      if (token && token !== "undefined" && token !== "null") {
        try {
          const res = await api.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        } catch (err) {
          console.warn("⚠️ Token inválido, cerrando sesión.");
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // 🧩 Guardar token cada vez que cambie
  useEffect(() => {
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // 🔐 Login manual (desde formulario)
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      console.log("🔐 Login response:", res.data);

      if (res.data?.token && res.data?.user) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        console.log("✅ Usuario logueado:", res.data.user);
      } else {
        console.warn("⚠️ Respuesta inesperada del backend:", res.data);
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error.response?.data || error);
      throw error; // se puede manejar desde el formulario de login
    }
  };


  // 🧍‍♂️ Registro manual
  const register = async (name, email, password) => {
    const res = await api.post("/api/auth/register", { name, email, password });
    setUser(res.data.user);
    setToken(res.data.token);
  };

  // 🚪 Cerrar sesión
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  // 👇 ✅ Aquí agregamos setUser y setToken para que estén disponibles
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
