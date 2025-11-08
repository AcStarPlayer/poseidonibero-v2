import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🧩 Cargar carrito desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // 🧩 Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ Agregar producto al carrito (diferencia tallas)
  const addToCart = (product, quantity = 1, customization = {}) => {
    console.log("🟢 Producto recibido al agregar al carrito:", product);

    // Normalizar imágenes
    const normalizedImages =
      product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [product.imageUrl]
        : [];

    console.log("🟢 Imágenes que se guardarán:", normalizedImages);

    // 🔑 Generar clave única (producto + talla)
    const uniqueKey = `${product._id}_${customization?.size || "default"}`;
    console.log("🧩 Clave única generada:", uniqueKey);

    setCart((prev) => {
      const existing = prev.find((p) => p.uniqueKey === uniqueKey);

      if (existing) {
        console.log("🔁 Ya existe en carrito → sumando cantidad");
        return prev.map((p) =>
          p.uniqueKey === uniqueKey
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        console.log("🆕 Nuevo producto/talla → agregando al carrito");
        return [
          ...prev,
          {
            uniqueKey,
            product: product._id,
            name: product.name,
            price: product.price,
            images: normalizedImages,
            category: product.category,
            quantity,
            customization,
            description: product.description || "", // 🟢 NUEVO: guarda descripción del producto
          },
        ];
      }
    });

    Swal.fire({
      icon: "success",
      title: "Producto agregado al carrito",
      text: `${product.name} se añadió correctamente.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ❌ Eliminar producto/talla específico del carrito
  const removeFromCart = (uniqueKey) => {
    console.log("🗑️ Eliminando del carrito:", uniqueKey);
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  };

  // 🧹 Vaciar carrito
  const clearCart = () => {
    console.log("🧹 Vaciando carrito completo");
    setCart([]);
    localStorage.removeItem("cart");
  };

  // 🧾 Crear pedido
  const createOrder = async (shippingAddress, paymentMethod) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");

      if (!token) {
        Swal.fire(
          "Error",
          "Debes iniciar sesión para completar la compra",
          "error"
        );
        return;
      }

      if (cart.length === 0) {
        Swal.fire(
          "Carrito vacío",
          "Agrega productos antes de continuar",
          "warning"
        );
        return;
      }

      const orderData = {
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          customization: item.customization || {},
        })),
        shippingAddress,
        paymentMethod,
      };

      console.log("📦 Enviando pedido:", orderData);

      const res = await api.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Pedido creado con éxito:", res.data);

      Swal.fire({
        icon: "success",
        title: "Pedido creado con éxito 🧾",
        text: "Tu pedido ha sido procesado correctamente.",
        confirmButtonText: "Ver mis pedidos",
      }).then(() => {
        window.location.href = "/mis-pedidos";
      });

      clearCart();
      return res.data;
    } catch (error) {
      console.error("❌ Error al crear pedido:", error);

      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo crear el pedido.",
        "error"
      );
    }
  };

  // 💰 Calcular total
  const getTotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        createOrder,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
