import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();

// ====================================================
// 🧱 CREAR PEDIDO
// Ruta: POST /api/orders
// Acceso: Usuario autenticado
// ====================================================
router.post("/", protect, createOrder);

// ====================================================
// 📋 OBTENER PEDIDOS DEL USUARIO AUTENTICADO
// Ruta: GET /api/orders/my-orders
// Acceso: Usuario autenticado
// ====================================================
router.get("/my-orders", protect, getMyOrders);

// ====================================================
// 📋 OBTENER PEDIDOS POR USUARIO (para MisPedidos.jsx)
// Ruta: GET /api/orders/user
// Acceso: Usuario autenticado
// ====================================================
router.get("/user", protect, getOrdersByUser);

// ====================================================
// 📦 OBTENER TODOS LOS PEDIDOS (solo admin)
// Ruta: GET /api/orders
// Acceso: Admin
// ====================================================
router.get("/", protect, admin, getAllOrders);

// ====================================================
// 📄 OBTENER DETALLE DE UN PEDIDO POR ID
// Ruta: GET /api/orders/:id
// Acceso: Usuario autenticado o Admin
// ====================================================
router.get("/:id", protect, getOrderById);

// ====================================================
// 🚚 ACTUALIZAR ESTADO DEL PEDIDO (solo admin)
// Ruta: PUT /api/orders/:id/status
// Acceso: Admin
// ====================================================
router.put("/:id/status", protect, admin, updateOrderStatus);

// ====================================================
// ❌ ELIMINAR PEDIDO (solo admin)
// Ruta: DELETE /api/orders/:id
// Acceso: Admin
// ====================================================
router.delete("/:id", protect, admin, deleteOrder);

export default router;
