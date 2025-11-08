// ============================
// Rutas de Usuarios Poseidón
// ============================

import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();

// 📋 Solo los administradores pueden ver o gestionar usuarios
router.get("/", protect, admin, getUsers);       // Obtener todos los usuarios
router.get("/:id", protect, admin, getUserById); // Obtener usuario por ID
router.patch("/:id", protect, admin, updateUser); // Actualizar usuario o rol
router.delete("/:id", protect, admin, deleteUser); // Eliminar usuario

export default router;
