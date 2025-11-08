import mongoose from "mongoose";

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // Ej: "S", "M", "L", "XL"
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    description: { type: String, trim: true },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    category: { type: String, trim: true, default: "General" },

    // 🔹 Múltiples imágenes (hasta 5)
    images: {
      type: [String],
      default: [],
      get: (images) =>
        images.map((url) =>
          url.startsWith("http")
            ? url
            : `${process.env.BASE_URL || "http://localhost:5000"}${url}`
        ),
    },

    // 🔹 Stock general
    stock: { type: Number, default: 0, min: [0, "El stock no puede ser negativo"] },

    // 🔹 Stock por talla
    sizes: [sizeStockSchema],

    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

export default mongoose.model("Product", productSchema);
