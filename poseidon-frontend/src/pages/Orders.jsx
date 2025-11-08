import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/orders.css";

// Recharts para gráficas
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// html2canvas para exportar gráfica a PNG
import html2canvas from "html2canvas";

const BASE_URL = "http://localhost:5000";

// Paleta para PieChart (Pendiente, Enviado, Entregado)
const PIE_COLORS = ["#FFC107", "#0DCAF0", "#198754"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Nuevos estados añadidos:
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(""); // formato YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // formato YYYY-MM-DD

  // Ref para la sección de gráficas (descargar PNG)
  const chartsRef = useRef(null);

  // ================================
  // 🔹 Obtener pedidos (solo ADMIN)
  // ================================
  const fetchOrders = async (showAlert = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "Debes iniciar sesión como administrador", "error");
        return;
      }

      const res = await api.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔧 Ajuste de URLs de imagen y preservo estructura
      const formatted = res.data.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          imageUrl: item.imageUrl
            ? item.imageUrl.startsWith("http")
              ? item.imageUrl
              : `${BASE_URL}${item.imageUrl}`
            : "/no-image.png",
        })),
      }));

      setOrders(formatted);
      setFilteredOrders(formatted);

      if (showAlert)
        Swal.fire({
          icon: "success",
          title: "Pedidos actualizados",
          timer: 1200,
          showConfirmButton: false,
        });
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================================
  // 🔹 Filtrar por estado
  // ================================
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    filtrarPedidos(newFilter, searchTerm);
  };

  // ================================
  // 🔹 Filtro combinado por estado y búsqueda
  // ================================
  const filtrarPedidos = (estado, texto) => {
    let resultado = [...orders];

    if (estado !== "Todos") {
      resultado = resultado.filter((o) => o.status === estado);
    }

    if (texto?.trim()) {
      const term = texto.toLowerCase();
      resultado = resultado.filter(
        (o) =>
          o.user?.name?.toLowerCase().includes(term) ||
          o.user?.email?.toLowerCase().includes(term) ||
          o._id?.toLowerCase().includes(term) ||
          o.orderCode?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(resultado);
  };

  // ================================
  // 🔹 Buscar por cliente o ID
  // ================================
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filtrarPedidos(filter, term);
  };

  // ================================
  // 🔹 Actualizar estado del pedido
  // ================================
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El pedido ahora está en "${newStatus}"`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchOrders();
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      Swal.fire("Error", "No se pudo actualizar el estado del pedido", "error");
    }
  };

  // ================================
  // 🔹 Generar PDF del pedido
  // ================================
  const generarPDF = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Tienda Online - Resumen de Pedido", 14, 20);
    doc.setFontSize(11);
    doc.text(`Código: ${order.orderCode || "N/A"}`, 14, 28);
    doc.text(`Pedido #${order._id.slice(-6).toUpperCase()}`, 14, 36);
    doc.text(`Cliente: ${order.user?.name || "N/A"}`, 14, 44);
    doc.text(`Email: ${order.user?.email || "N/A"}`, 14, 52);
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`, 14, 60);

    autoTable(doc, {
      startY: 70,
      head: [["Producto", "Talla", "Cantidad", "Precio", "Subtotal"]],
      body: order.items.map((i) => [
        i.name,
        i.customization?.size || "N/A",
        i.quantity,
        `$${i.price.toLocaleString("es-CO")}`,
        `$${(i.price * i.quantity).toLocaleString("es-CO")}`,
      ]),
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total: $${order.totalPrice.toLocaleString("es-CO")}`, 160, finalY);

    doc.save(`Pedido-${order.orderCode || order._id}.pdf`);
  };

  // ================================
  // 🔹 Exportar todos los pedidos a PDF
  // ================================
  const exportarPedidosPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("📦 Reporte General de Pedidos", 14, 20);
    doc.setFontSize(10);

    autoTable(doc, {
      startY: 30,
      head: [["Código", "Cliente", "Estado", "Total", "Fecha"]],
      body: filteredOrders.map((o) => [
        o.orderCode || o._id.slice(-6).toUpperCase(),
        o.user?.name || "N/A",
        o.status,
        `$${o.totalPrice.toLocaleString("es-CO")}`,
        new Date(o.createdAt).toLocaleDateString(),
      ]),
    });

    doc.save("Reporte_Pedidos.pdf");
  };

  // ================================
  // 🔹 Exportar a CSV
  // ================================
  const exportarCSV = () => {
    const encabezado = ["Código", "Cliente", "Email", "Estado", "Total", "Fecha"];
    const filas = filteredOrders.map((o) => [
      o.orderCode || o._id.slice(-6).toUpperCase(),
      o.user?.name,
      o.user?.email,
      o.status,
      o.totalPrice,
      new Date(o.createdAt).toLocaleString(),
    ]);

    const contenido = [encabezado, ...filas].map((r) => r.join(",")).join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pedidos.csv";
    link.click();
  };

  // ================================
  // ==== Estadísticas y KPIs =======
  // ================================
  // Filtrar por rango de fechas (si están definidas)
  const ordersInRange = useMemo(() => {
    if (!startDate && !endDate) return orders;
    const start = startDate ? new Date(startDate + "T00:00:00") : null;
    const end = endDate ? new Date(endDate + "T23:59:59") : null;

    return orders.filter((o) => {
      const created = new Date(o.createdAt);
      if (start && created < start) return false;
      if (end && created > end) return false;
      return true;
    });
  }, [orders, startDate, endDate]);

  // Conteo por estado (PieChart) usando ordersInRange para respetar rango de fechas
  const statsByStatus = useMemo(() => {
    const counts = { Pendiente: 0, Enviado: 0, Entregado: 0 };
    ordersInRange.forEach((o) => {
      if (o.status in counts) counts[o.status]++;
      else counts.Pendiente++;
    });
    return [
      { name: "Pendiente", value: counts.Pendiente },
      { name: "Enviado", value: counts.Enviado },
      { name: "Entregado", value: counts.Entregado },
    ];
  }, [ordersInRange]);

  // Ventas por mes (últimos 6 meses) usando ordersInRange
  const salesByMonth = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      months.push({ key: `${d.getFullYear()}-${d.getMonth() + 1}`, label, total: 0 });
    }

    ordersInRange.forEach((o) => {
      const created = new Date(o.createdAt);
      const key = `${created.getFullYear()}-${created.getMonth() + 1}`;
      const entry = months.find((m) => m.key === key);
      if (entry) entry.total += Number(o.totalPrice || 0);
    });

    return months.map((m) => ({ name: m.label, total: Math.round(m.total) }));
  }, [ordersInRange]);

  // KPIs: totalOrders, totalSales, avgTicket
  const kpis = useMemo(() => {
    const totalOrders = ordersInRange.length;
    const totalSales = ordersInRange.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0);
    const avgOrder = totalOrders ? totalSales / totalOrders : 0;
    return {
      totalOrders,
      totalSales,
      avgOrder,
    };
  }, [ordersInRange]);

  // ================================
  // 🔹 Descargar sección de gráficas como PNG
  // ================================
  const descargarChartsPNG = async () => {
    if (!chartsRef.current) {
      Swal.fire("Error", "No se encontró la sección de gráficas", "error");
      return;
    }
    try {
      const canvas = await html2canvas(chartsRef.current, { scale: 2 });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "graficas_pedidos.png";
      link.click();
    } catch (err) {
      console.error("❌ Error exportando gráfica PNG:", err);
      Swal.fire("Error", "No se pudo generar la imagen", "error");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Cargando pedidos...</p>
      </div>
    );

  return (
    <div className="container mt-4">
      {/* Header + controles */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="fw-bold text-primary">📦 Gestión de Pedidos</h2>
        <div className="d-flex gap-2" style={{ alignItems: "center" }}>
          <select
            className="form-select"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar cliente o código..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ minWidth: "220px" }}
          />

          <button className="btn btn-outline-primary" onClick={() => fetchOrders(true)}>
            🔄 Actualizar
          </button>

          <button className="btn btn-outline-success" onClick={exportarPedidosPDF}>
            📑 Exportar PDF
          </button>

          <button className="btn btn-outline-secondary" onClick={exportarCSV}>
            📄 Exportar CSV
          </button>
        </div>
      </div>

      {/* Rango de fechas + KPIs */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mb-2">
          <div className="d-flex gap-2 align-items-center">
            <label className="mb-0">Desde:</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="mb-0">Hasta:</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <button
              className="btn btn-outline-primary"
              onClick={() => {
                // aplicar filtro por fecha: ya se calcula automáticamente por ordersInRange
                // forzar recalculo filtrado en la tabla: aplicamos filtro de estado y búsqueda
                filtrarPedidos(filter, searchTerm);
              }}
            >
              Aplicar
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                filtrarPedidos(filter, searchTerm);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="col-md-6">
          {/* KPIs */}
          <div className="d-flex justify-content-end gap-3">
            <div className="card p-2 text-center shadow-sm" style={{ minWidth: 140 }}>
              <div className="small text-muted">Pedidos</div>
              <div className="h5 mb-0">{kpis.totalOrders}</div>
            </div>

            <div className="card p-2 text-center shadow-sm" style={{ minWidth: 160 }}>
              <div className="small text-muted">Ventas Totales</div>
              <div className="h5 mb-0">${kpis.totalSales.toLocaleString("es-CO")}</div>
            </div>

            <div className="card p-2 text-center shadow-sm" style={{ minWidth: 160 }}>
              <div className="small text-muted">Ticket Promedio</div>
              <div className="h5 mb-0">${Math.round(kpis.avgOrder).toLocaleString("es-CO")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas visuales */}
      <div className="row mb-4" ref={chartsRef}>
        <div className="col-md-5 mb-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold">Pedidos por estado</h6>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={statsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                  >
                    {statsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="d-flex justify-content-end mt-2">
              <button className="btn btn-sm btn-outline-primary" onClick={descargarChartsPNG}>
                📷 Descargar gráfica (PNG)
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-7 mb-3">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold">Ventas (últimos 6 meses)</h6>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip formatter={(value) => `$${Number(value).toLocaleString("es-CO")}`} />
                  <Legend />
                  <Bar dataKey="total" name="Ventas" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {filteredOrders.length === 0 ? (
        <p>No hay pedidos para este filtro.</p>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td className="text-muted small">{o.orderCode || o._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <strong>{o.user?.name}</strong>
                    <br />
                    <span className="text-muted small">{o.user?.email}</span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === "Entregado" ? "bg-success" : o.status === "Enviado" ? "bg-info text-dark" : "bg-warning text-dark"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <strong>${o.totalPrice.toLocaleString("es-CO")}</strong>
                  </td>
                  {/* ✅ BLOQUE ACTUALIZADO PARA MOSTRAR TALLAS Y CANTIDADES CORRECTAS */}
                  <td>
                    <div className="d-flex flex-wrap gap-3">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="text-center">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            width="55"
                            height="55"
                            className="rounded border mb-1"
                            onError={(e) => (e.target.src = "/no-image.png")}
                          />
                          <div className="small fw-semibold">{it.name}</div>

                          {/* 🔹 Mostrar categoría si existe */}
                          {it.category && (
                            <div className="text-muted small">{it.category}</div>
                          )}

                          {/* 🔹 Mostrar tallas y cantidades (de array sizes[]) */}
                          {it.sizes && it.sizes.length > 0 ? (
                            <div className="text-success small">
                              {it.sizes.map((s, sIdx) => (
                                <div key={sIdx}>
                                  🧵 {s.size}: {s.quantity}u
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted small">Sin talla</div>
                          )}

                          {/* 🔹 Mostrar personalización si existe */}
                          {it.customization?.text && (
                            <div className="text-muted small">🖋 {it.customization.text}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  
                  <td>
                    <select
                      className="form-select form-select-sm mb-2"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                    </select>

                    <button className="btn btn-sm btn-outline-primary w-100" onClick={() => setSelectedOrder(o)}>
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedOrder && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle del Pedido #{selectedOrder._id.slice(-6).toUpperCase()}</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>

              <div className="modal-body">
                <p><strong>Cliente:</strong> {selectedOrder.user?.name}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                <p><strong>Fecha:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Estado:</strong> {selectedOrder.status}</p>
                <p><strong>Método de pago:</strong> {selectedOrder.paymentMethod || "N/A"}</p>

                {selectedOrder.shippingAddress && (
                  <>
                    <h6 className="fw-bold mt-3">Dirección de envío</h6>
                    <p className="mb-0">
                      {selectedOrder.shippingAddress.fullName} <br />
                      {selectedOrder.shippingAddress.address} <br />
                      {selectedOrder.shippingAddress.city} <br />
                      Tel: {selectedOrder.shippingAddress.phone}
                    </p>
                  </>
                )}

                <h6 className="fw-bold mt-4">Productos</h6>
                {/* 🧾 Listado de productos con tallas reales */}
                <ul className="list-group">
                  {selectedOrder.items.map((item, i) => (
                    <li
                      key={i}
                      className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          width="60"
                          height="60"
                          className="rounded border me-3"
                          onError={(e) => (e.target.src = "/no-image.png")}
                        />
                        <div>
                          {/* 🧩 Nombre del producto */}
                          <strong>{item.name}</strong>
                          <br />
                          <span className="text-muted small">{item.category || "Sin categoría"}</span>

                          {/* 👕 Mostrar las tallas seleccionadas */}
                          {item.sizes && item.sizes.length > 0 ? (
                            <ul className="list-unstyled mb-0 mt-1 small">
                              {item.sizes.map((s, idx) => (
                                <li key={idx}>
                                  <span className="text-success">
                                    👕 Talla: <strong>{s.size}</strong> — Cant: {s.quantity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            // 🔹 Si no hay tallas, se muestra la talla única o info base
                            <div className="text-muted small">
                              Talla: {item.customization?.size || "Única"} — Cantidad: {item.quantity}
                            </div>
                          )}

                          {/* ✏️ Personalización opcional */}
                          {item.customization?.text && (
                            <div className="text-muted small mt-1">
                              🖋 Personalización: {item.customization.text}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 💰 Precio total por ítem */}
                      <div className="text-end fw-bold mt-2 mt-md-0">
                        ${(
                          item.price *
                          (item.sizes?.reduce((acc, s) => acc + s.quantity, 0) || item.quantity)
                        ).toLocaleString("es-CO")}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="text-end mt-3">
                  <h5>Total: ${selectedOrder.totalPrice.toLocaleString("es-CO")}</h5>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                <button className="btn btn-success" onClick={() => generarPDF(selectedOrder)}>Descargar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
