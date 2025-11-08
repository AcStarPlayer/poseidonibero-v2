import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url"; // 👈 necesario para manejar __dirname correctamente

// 🧩 Cargar variables de entorno
dotenv.config();
console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

// 📦 Importar rutas
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// ⚙️ Configuración de middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// 📁 Servir imágenes subidas desde /uploads (💪 versión robusta)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 👇 importante: "../uploads" si la carpeta está fuera del backend
const uploadsPath = path.join(__dirname, "../uploads");

// 🧭 Mostrar en consola la ruta real desde donde se sirven las imágenes
console.log("📂 Serviendo archivos estáticos desde:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

// ✅ Registrar rutas API principales
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 🌊 Ruta base para verificar funcionamiento
app.get("/", (req, res) => {
  res.send("🌊 API Poseidón funcionando correctamente");
});

// ⚠️ Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada 🌊",
    path: req.originalUrl,
  });
});

// ⚠️ Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error("🔥 Error global:", err);
  res.status(500).json({
    message: "Error interno del servidor",
    error: err.message || "Desconocido",
  });
});

// 🚀 Conexión y arranque del servidor
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 🔧 NUEVO: permitir que Render use la variable de entorno PORT y escuche en todas las IPs
// (Render usa una IP dinámica, por eso se agrega el 0.0.0.0)
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ Base de datos MongoDB conectada correctamente");

    // 🔧 Cambio leve: usar app.listen con "0.0.0.0" para compatibilidad Render/Vercel
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
      console.log(`📡 Modo: ${process.env.NODE_ENV || "desarrollo"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  });
