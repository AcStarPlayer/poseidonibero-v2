import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import "../styles/checkout.css"; // puedes crear este archivo o quitar esta línea

const Checkout = () => {
  const { cart, getTotal, createOrder } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Efectivo");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
      return;
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      Swal.fire("Faltan datos", "Completa todos los campos de envío", "warning");
      return;
    }

    await createOrder(shippingAddress, paymentMethod);
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">🧾 Confirmar Pedido</h2>

      <div className="checkout-grid">
        {/* 🧺 Resumen del carrito */}
        <div className="checkout-summary">
          <h3>Tu carrito</h3>
          {cart.length === 0 ? (
            <p>No hay productos en el carrito</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.product} className="checkout-item">
                  <img
                    src={item.imageUrl?.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                    className="checkout-item-image"
                  />
                  <div>
                    <p className="item-name">{item.name}</p>
                    <p>
                      {item.quantity} × ${item.price.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <hr />
          <h3>Total: ${getTotal().toLocaleString()}</h3>
        </div>

        {/* 📦 Formulario de envío */}
        <div className="checkout-form">
          <h3>Datos de envío</h3>
          <form onSubmit={handleSubmit}>
            <label>Nombre completo</label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, fullName: e.target.value })
              }
              required
            />

            <label>Dirección</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
              required
            />

            <label>Ciudad</label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, city: e.target.value })
              }
              required
            />

            <label>Código postal</label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
              }
              required
            />

            <label>País</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, country: e.target.value })
              }
              required
            />

            <label>Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>

            <button type="submit" className="checkout-btn">
              Confirmar pedido
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
