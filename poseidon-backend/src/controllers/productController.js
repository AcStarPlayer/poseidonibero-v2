// controllers/productController.js
import Product from "../models/Product.js";
import path from "path";

// 📦 Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map((p) => p.toJSON({ getters: true })));
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// 🔍 Obtener un solo producto por ID
export const getProduct = async (req, res) => {
  try {
    console.log("🧩 getProduct() solicitado con ID:", req.params.id);

    const product = await Product.findById(req.params.id);
    console.log("📦 Producto encontrado:", product);

    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });

    res.json(product.toJSON({ getters: true }));
  } catch (err) {
    console.error("❌ Error al obtener producto:", err.message);
    res.status(500).json({ 
      message: "Error al obtener el producto",
      error: err.message 
    });
  }
};


// ➕ Crear un nuevo producto (múltiples imágenes y tallas)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, featured } = req.body;

    // 🧩 Manejar tallas (JSON string → objeto)
    let sizes = [];
    if (req.body.sizes) {
      try {
        sizes = JSON.parse(req.body.sizes);
      } catch {
        sizes = [];
      }
    }

    // 🖼️ Manejar múltiples imágenes
    const images =
      req.files && req.files.length > 0
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : ["/uploads/default.jpg"];

    const product = new Product({
      name,
      description,
      price,
      category,
      featured,
      sizes,
      images,
    });

    await product.save();
    res.status(201).json(product.toJSON({ getters: true }));
  } catch (err) {
    console.error("❌ Error al crear producto:", err);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// ✏️ Actualizar producto existente (múltiples imágenes y tallas)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });

    const { name, description, price, category, featured } = req.body;

    // 📋 Campos simples
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.featured = featured ?? product.featured;

    // 🧩 Actualizar tallas
    if (req.body.sizes) {
      try {
        const parsedSizes = JSON.parse(req.body.sizes);
        product.sizes = parsedSizes;

        // ✅ Calculamos el stock total sumando los valores por talla
        const totalStock = parsedSizes.reduce(
          (sum, sz) => sum + (parseInt(sz.stock) || 0),
          0
        );
        product.stock = totalStock;
      } catch (err) {
        console.warn("⚠️ Formato inválido de sizes:", err.message);
      }
    }

    // 🖼️ Actualizar imágenes si se subieron nuevas
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await product.save();
    res.json(product.toJSON({ getters: true }));
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// 🗑️ Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};
