import axios from "axios";

/* 
=============================================
🧩 MODIFICACIÓN — Configuración automática del entorno
Detecta si estás ejecutando el frontend localmente (localhost)
o si está corriendo en producción (por ejemplo, Vercel).
=============================================
*/
const isLocal = window.location.hostname === "localhost";

/* 
🧠 Si estás en entorno local → usa tu backend en localhost:5000
🌐 Si estás en entorno de producción → usa la variable de entorno 
   de Vercel (REACT_APP_API_URL) o tu backend Render como fallback.
*/
const baseURL = isLocal
  ? "http://localhost:5000" // 👉 entorno local
  : process.env.REACT_APP_API_URL || "https://poseidon-backend-v2tf.onrender.com"; // 👉 entorno producción (Render)
  
console.log("🌐 Axios conectado a:", baseURL); // 🔍 depuración: confirma qué URL se está usando

// ⚙️ Crea la instancia base de Axios
const api = axios.create({
  baseURL,
  // timeout: 5000, // ⏳ opcional — puedes activarlo si quieres limitar tiempos de espera
});

/* 
======================================================
🧩 Interceptor de solicitudes — Autenticación
Agrega automáticamente el token JWT a cada petición si existe
en localStorage (usuario normal o admin).
======================================================
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // 🔒 Prioriza el token disponible (admin o usuario)
    if (token || adminToken) {
      config.headers.Authorization = `Bearer ${token || adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Exporta la instancia lista para usar en toda la app
export default api;
