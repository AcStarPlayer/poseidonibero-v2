// ============================
// SEED DE INICIO - seed.js
// ============================

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config(); // Carga las variables del archivo .env

const seed = async () => {
  try {
    // Conexión a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpia las colecciones previas (usuarios y productos)
    await User.deleteMany();
    await Product.deleteMany();

    // Encripta contraseña del admin
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("Admin123!", salt);

    // Crea el usuario admin
    const admin = await User.create({
      name: "Admin Poseidón",
      email: "admin@poseidon.com",
      password: adminPassword,
      role: "admin"
    });

    console.log("✅ Usuario administrador creado:", admin.email);

    // Crea productos de ejemplo
    const productos = await Product.create([
      {
        name: "Camiseta Poseidón - Básica",
        description: "100% algodón, color blanco",
        price: 40000,
        category: "Camisetas",
        stock: 20
      },
      {
        name: "Camiseta Poseidón - Estampada",
        description: "Impresión DTF full color",
        price: 55000,
        category: "Camisetas",
        stock: 15
      }
    ]);

    console.log("✅ Productos de ejemplo creados:", productos.length);
    console.log("🌱 Seed completado con éxito");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error ejecutando seed:", error);
    process.exit(1);
  }
};

seed();
