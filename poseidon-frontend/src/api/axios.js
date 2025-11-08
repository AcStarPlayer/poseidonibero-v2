import axios from "axios";

// 🧩 Detecta si estás trabajando en local o en producción
// Esto permite cambiar automáticamente el backend sin tocar código
const isLocal = window.location.hostname === "localhost";

// 🧠 Si estás en local → usa localhost:5000
// 🌐 Si estás en producción → usa el backend de Render
const baseURL = isLocal
  ? "http://localhost:5000" // entorno local
  : process.env.REACT_APP_API_URL || "https://poseidon-backend-v2tf.onrender.com"; // entorno desplegado

console.log("🌐 Axios conectado a:", baseURL); // 🔎 depuración (mantiene tu línea original)

// ⚙️ Crea la instancia base de Axios
const api = axios.create({
  baseURL,
  // timeout: 5000, // opcional, lo dejamos comentado como en tu código
});

// 🧩 Interceptor — agrega el token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // 🔒 Mantiene tu lógica original, pero ahora prioriza el token disponible
    if (token || adminToken) {
      config.headers.Authorization = `Bearer ${token || adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
