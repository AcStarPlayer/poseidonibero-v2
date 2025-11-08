// ============================
// Middleware de autenticación y autorización
// ============================

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ----------------------------
// PROTEGER RUTAS (verifica token JWT)
// ----------------------------
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado, token faltante" });
    }

    const token = authHeader.split(" ")[1];

    // Verificar token con la clave secreta
    const payload = jwt.verify(token, process.env.CLAVE_JWT);

    // Buscar el usuario en la base de datos
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Error en verificación de token:", err.message);
    res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

// ----------------------------
// VERIFICAR ADMINISTRADOR
// ----------------------------
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Requiere permisos de administrador" });
  }
};
