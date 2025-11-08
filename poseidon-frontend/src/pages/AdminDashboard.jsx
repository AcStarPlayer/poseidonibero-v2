import React, { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ Importa tu configuración axios
import "./../styles/admin.css"; // ✅ Asegúrate de que el CSS esté en src/styles/admin.css

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar datos desde el backend
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 📦 Obtener productos desde /api/products
      const resProducts = await api.get("/api/products", { headers });
      const products = resProducts.data;

      const totalProducts = products.length;
      const lowStock = products.filter((p) => p.stock < 5).length;

      // 💰 Intentar obtener ventas desde /api/orders
      let totalSales = 0;
      try {
        const resOrders = await api.get("/api/orders", { headers });
        const orders = resOrders.data;
        totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      } catch {
        console.warn("⚠️ No se encontró endpoint /api/orders, mostrando solo productos.");
      }

      setStats({ totalProducts, totalSales, lowStock });
    } catch (error) {
      console.error("❌ Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="admin-header">
        <h2>📊 Dashboard Administrativo</h2>
      </div>

      <div className="row g-4">
        {/* Total de productos */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <h5 className="text-primary fw-bold">Productos totales</h5>
            <p className="display-6 text-dark">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Ventas totales */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <h5 className="text-success fw-bold">Ventas totales</h5>
            <p className="display-6 text-dark">
              {stats.totalSales > 0
                ? `$${stats.totalSales.toLocaleString("es-CO")}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Productos con stock bajo */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <h5 className="text-danger fw-bold">Stock bajo</h5>
            <p className="display-6 text-dark">{stats.lowStock}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 text-muted text-center">
        <p>💡 Datos obtenidos en tiempo real desde el backend de Poseidón.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
