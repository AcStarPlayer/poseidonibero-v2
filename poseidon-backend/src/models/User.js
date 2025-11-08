// ============================
// MODELO DE USUARIO - User.js
// ============================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"]
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Correo inválido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"]
    },
    // Campo que define si el usuario es cliente o admin
    role: {
      type: String,
      enum: ["cliente", "admin"],
      default: "cliente"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // añade createdAt y updatedAt automáticos
  }
);

export default mongoose.model("User", userSchema);
