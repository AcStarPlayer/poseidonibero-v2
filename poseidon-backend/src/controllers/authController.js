// ==========================
// Controlador de autenticación Poseidón
// ==========================

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔑 Función para crear el token JWT (🔥 ACTUALIZADA)
const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role, // 👈 incluimos el rol en el token
    },
    process.env.CLAVE_JWT,
    { expiresIn: process.env.JWT_DIAS || "7d" }
  );
};

// ==========================
// REGISTRO DE USUARIO
// ==========================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Correo ya registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 🆕 el role por defecto ya es "cliente"
    const user = await User.create({ name, email, password: hashed });

    // Generar token con usuario completo
    const token = createToken(user);

    res.status(201).json({
      msg: "Usuario registrado correctamente",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role, // 👈 agregamos también aquí
      },
    });
  } catch (err) {
    console.error("❌ Error en register:", err);
    res
      .status(500)
      .json({ message: "Error en el registro", error: err.message });
  }
};

// ==========================
// LOGIN DE USUARIO
// ==========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // 🆕 generar token con usuario completo
    const token = createToken(user);

    res.json({
      msg: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role, // 👈 agregamos aquí también
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ message: "Error en login", error: err.message });
  }
};

// ==========================
// PERFIL DEL USUARIO (ruta protegida)
// ==========================
export const me = async (req, res) => {
  res.json({ user: req.user });
};
