import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ===============================
// 📦 Crear pedido
// ===============================
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No hay productos en el pedido" });
    }

    let totalPrice = 0;
    const finalItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado (${item.product})` });
      }

      // 🧩 Verificamos si tiene tallas
      if (item.sizes && item.sizes.length > 0) {
        for (const s of item.sizes) {
          const { size, quantity } = s;

          // Buscar talla en el producto
          const sizeObj = product.sizes.find(sz => sz.size === size);
          if (!sizeObj) {
            return res.status(400).json({
              message: `La talla ${size} no existe para el producto ${product.name}`,
            });
          }

          if (sizeObj.stock < quantity) {
            return res.status(400).json({
              message: `Stock insuficiente para la talla ${size} del producto ${product.name}`,
            });
          }

          // Restar stock de esa talla
          sizeObj.stock -= quantity;
          await product.save();

          // Calcular precio y añadir al total
          const price = product.price * quantity;
          totalPrice += price;

          // Añadir ítem con todas las tallas
          finalItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            // 🟢 Se agrega descripción para que quede disponible en la orden
            description: product.description,
            imageUrl: product.images?.[0] || "/uploads/default.jpg",
            sizes: [{ size, quantity }],
          });
        }
      } else {
        // 🧩 Si no tiene tallas, usa stock general
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Stock insuficiente para ${product.name}`,
          });
        }

        product.stock -= item.quantity;
        await product.save();

        const price = product.price * item.quantity;
        totalPrice += price;

        finalItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          // 🟢 Agregamos descripción también en este caso
          description: product.description,
          imageUrl: product.images?.[0] || "/uploads/default.jpg",
          sizes: [{ size: "Única", quantity: item.quantity }],
        });
      }
    }

    // 📦 Crear pedido
    const order = await Order.create({
      user: userId,
      items: finalItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: "Pendiente",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};

// ===============================
// 📋 Obtener pedidos del usuario autenticado
// ===============================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      // 🟢 AGREGADO: description e images para que se muestren en el front
      .populate("items.product", "name price imageUrl category description images")
      .sort({ createdAt: -1 });

    // 🔹 Asegurar que se devuelva la talla y descripción
    const ordersWithSize = orders.map((order) => ({
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        size: item.customization?.size || "No especificada",
        // 🟢 Incluimos descripción aquí también
        description: item.product?.description || "Sin descripción disponible",
      })),
    }));

    res.json(ordersWithSize);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// ===============================
// 📋 Obtener pedidos por usuario (MisPedidos.jsx)
// ===============================
export const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        // 🟢 AGREGADO: description e images
        select: "name price imageUrl category description images stock stockBySize",
      })
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron pedidos para este usuario" });
    }

    // 🔹 Incluye información completa
    const formattedOrders = orders.map((order) => ({
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        size: item.customization?.size || "No especificada",
        category: item.product?.category || "General",
        imageUrl: item.product?.images?.[0] || "/uploads/default.jpg",
        name: item.product?.name || "Producto eliminado",
        // 🟢 NUEVO: descripción visible en el front
        description: item.product?.description || "Sin descripción disponible",
      })),
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos por usuario:", error);
    res.status(500).json({ message: "Error al obtener pedidos del usuario" });
  }
};

// ===============================
// 📋 Obtener todos los pedidos (admin)
// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      // 🟢 Incluimos description e images también aquí
      .populate({
        path: "items.product",
        select: "name price imageUrl category description images",
      })
      .sort({ createdAt: -1 });

    const ordersWithSize = orders.map((order) => ({
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        sizes: item.sizes || [],
        imageUrl: item.imageUrl || "/uploads/default.jpg",
        // 🟢 También agregamos descripción en el panel admin
        description: item.product?.description || "Sin descripción disponible",
      })),
    }));

    res.json(ordersWithSize);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// ===============================
// 📄 Obtener detalles de un pedido por ID
// ===============================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      // 🟢 Incluye descripción e imágenes
      .populate({
        path: "items.product",
        select: "name price imageUrl category description images stock stockBySize",
      });

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // 🔹 Verificación de permisos
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // 🔹 Adjuntar talla y descripción
    const orderWithSize = {
      ...order._doc,
      items: order.items.map((item) => ({
        ...item._doc,
        size: item.customization?.size || "No especificada",
        imageUrl: item.product?.images?.[0] || "/uploads/default.jpg",
        name: item.product?.name || "Producto eliminado",
        category: item.product?.category || "General",
        // 🟢 NUEVO - Descripción incluida en detalles
        description: item.product?.description || "Sin descripción disponible",
      })),
    };

    res.json(orderWithSize);
  } catch (error) {
    console.error("❌ Error al obtener pedido:", error);
    res.status(500).json({ message: "Error al obtener pedido" });
  }
};

// ===============================
// 🚚 Actualizar estado del pedido (admin)
// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    order.status = status || order.status;
    await order.save();

    res.json({ message: "Estado del pedido actualizado", order });
  } catch (error) {
    console.error("❌ Error al actualizar pedido:", error);
    res.status(500).json({ message: "Error al actualizar pedido" });
  }
};

// ===============================
// ❌ Eliminar pedido (admin)
// ===============================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    await order.deleteOne();

    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar pedido:", error);
    res.status(500).json({ message: "Error al eliminar pedido" });
  }
};
