import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/orders.css";

const BASE_URL = "http://localhost:5000";

const MisPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 📦 Obtener pedidos del usuario logueado
  const fetchOrders = async (showAlert = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "Debes iniciar sesión para ver tus pedidos", "error");
        return;
      }

      const res = await api.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🖼️ Aseguramos URLs completas
      const formatted = res.data.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          imageUrl: item.imageUrl?.startsWith("http")
            ? item.imageUrl
            : `${BASE_URL}${item.imageUrl}`,
        })),
      }));

      setOrders(formatted);
      if (showAlert)
        Swal.fire({
          icon: "success",
          title: "Pedidos actualizados",
          timer: 1200,
          showConfirmButton: false,
        });
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      Swal.fire("Error", "No se pudieron cargar tus pedidos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🧾 Generar PDF profesional con logo, encabezado, tallas y personalización
  const generarPDF = (order) => {
    const doc = new jsPDF();

    // === 🧩 Logo + Encabezado ===
    const logo = new Image();
    logo.src = "/logo192.png";
    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 25, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Factura de Pedido", 105, 20, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Mi Tienda Online", 105, 28, { align: "center" });
      doc.text("📞 300 123 4567 | ✉️ contacto@mitienda.com", 105, 34, {
        align: "center",
      });

      // === 🧭 Información general del pedido ===
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Detalles del Pedido", 14, 50);

      doc.setFont("helvetica", "normal");
      doc.text(`ID Pedido: ${order._id}`, 14, 58);
      doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`, 14, 66);
      doc.text(`Método de pago: ${order.paymentMethod || "N/A"}`, 14, 74);
      doc.text(`Estado: ${order.status}`, 14, 82);

      // === 🏠 Dirección de envío ===
      if (order.shippingAddress) {
        const { fullName, address, city, phone } = order.shippingAddress;
        doc.setFont("helvetica", "bold");
        doc.text("Dirección de envío:", 14, 96);

        doc.setFont("helvetica", "normal");
        doc.text(`${fullName || ""}`, 14, 104);
        doc.text(`${address || ""}`, 14, 112);
        doc.text(`${city || ""}`, 14, 120);
        doc.text(`${phone || ""}`, 14, 128);
      }

      // === 🧮 Tabla de productos ===
      const items = order.items.map((i) => [
        i.name,
        i.customization?.size || "N/A", // 🔹 Añadido: talla seleccionada
        i.customization?.text || "-", // 🔹 Añadido: texto personalizado si existe
        i.quantity,
        `$${i.price.toLocaleString("es-CO")}`,
        `$${(i.price * i.quantity).toLocaleString("es-CO")}`,
      ]);

      autoTable(doc, {
        startY: 140,
        head: [["Producto", "Talla", "Personalización", "Cantidad", "Precio", "Subtotal"]],
        body: items,
        theme: "striped",
        headStyles: {
          fillColor: [0, 122, 204],
          textColor: [255, 255, 255],
          halign: "center",
        },
        bodyStyles: { halign: "center" },
      });

      // === 💰 Totales ===
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(
        `Total del pedido: $${order.totalPrice.toLocaleString("es-CO")}`,
        195,
        finalY,
        { align: "right" }
      );

      // === 📅 Pie de página ===
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(
        "Gracias por tu compra 💙 — Mi Tienda Online",
        105,
        285,
        { align: "center" }
      );

      // === 💾 Descargar ===
      doc.save(`Pedido-${order._id}.pdf`);
    };
  };

  // ==============================
  // 🔹 Render principal
  // ==============================
  if (loading)
    return <p className="text-center mt-5">Cargando pedidos...</p>;

  if (!orders.length)
    return (
      <div className="text-center mt-5">
        <h4>No tienes pedidos aún 🛒</h4>
        <p>Cuando realices una compra, aparecerá aquí.</p>
        <button className="btn btn-primary mt-3" onClick={() => fetchOrders(true)}>
          🔄 Actualizar
        </button>
      </div>
    );

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#041133" }}>
          Mis Pedidos
        </h2>
        <button className="btn btn-outline-primary" onClick={() => fetchOrders(true)}>
          🔄 Actualizar
        </button>
      </div>

      <div className="row">
        {orders.map((order) => (
          <div key={order._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">
                  Pedido #{order._id.slice(-6).toUpperCase()}
                </h5>
                <p className="text-muted mb-1">
                  Fecha: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-muted mb-1">
                  Total: <strong>${order.totalPrice?.toLocaleString("es-CO")}</strong>
                </p>
                <p
                  className={`fw-bold ${
                    order.status === "Entregado"
                      ? "text-success"
                      : order.status === "Enviado"
                      ? "text-info"
                      : "text-warning"
                  }`}
                >
                  Estado: {order.status || "Pendiente"}
                </p>

                {/* Miniaturas de productos */}
                <div className="d-flex flex-wrap gap-2 my-2">
                  {order.items.map((item, i) => (
                    <img
                      key={i}
                      src={item.imageUrl}
                      alt={item.name}
                      width="60"
                      height="60"
                      className="rounded border"
                      onError={(e) => {
                        if (!item.imageUrl.startsWith("http")) {
                          e.target.src = `${BASE_URL}${item.imageUrl}`;
                        } else {
                          e.target.src = "/no-image.png";
                        }
                      }}
                    />
                  ))}
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Ver detalles
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => generarPDF(order)}
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🪟 Modal Detalle */}
      {selectedOrder && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalle del Pedido #{selectedOrder._id.slice(-6).toUpperCase()}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <ul className="list-group">
                  {selectedOrder.items.map((item, i) => (
                    <li
                      key={i}
                      className="list-group-item d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          width="70"
                          height="70"
                          className="rounded me-3 border"
                          onError={(e) => {
                            if (!item.imageUrl.startsWith("http")) {
                              e.target.src = `${BASE_URL}${item.imageUrl}`;
                            } else {
                              e.target.src = "/no-image.png";
                            }
                          }}
                        />
                        <div>
                          <strong>{item.name}</strong> <br />
                          Talla:{" "}
                          <span className="fw-semibold">
                            {item.customization?.size || "N/A"}
                          </span>
                          <br />
                          Cantidad: {item.quantity} <br />
                          Precio: ${item.price.toLocaleString("es-CO")}
                          {item.customization?.text && (
                            <div className="text-muted small">
                              Personalización: {item.customization.text}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="fw-bold text-end">
                        ${ (item.price * item.quantity).toLocaleString("es-CO")}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="text-end mt-3">
                  <h5>Total: ${selectedOrder.totalPrice.toLocaleString("es-CO")}</h5>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
