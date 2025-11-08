import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import BASE_URL from "../config"; // 👈 Importa la URL base del backend

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔁 Obtener productos
  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error al obtener productos:", err);
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🗑️ Eliminar producto
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");

        if (!token) {
          Swal.fire(
            "Error",
            "No tienes permisos para eliminar productos",
            "error"
          );
          return;
        }

        await api.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          title: "Eliminado ✅",
          text: "El producto fue eliminado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        console.error("❌ Error al eliminar:", err);
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

  // 🖼️ Función para obtener la URL completa de la imagen
  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Cargando productos...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      {/* 🔷 Encabezado del panel */}
      <div className="admin-header">
        <h2>⚙️ Panel de Administración de Productos</h2>
        <div>
          <button
            className="btn btn-admin btn-admin-primary me-2"
            onClick={() => navigate("/create-product")}
          >
            ➕ Crear Producto
          </button>
          <button
            className="btn btn-admin btn-admin-secondary"
            onClick={fetchProducts}
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {/* 📦 Tabla de productos */}
      {products.length === 0 ? (
        <div className="empty-state">
          <h5>No hay productos disponibles</h5>
          <p>Agrega nuevos productos desde el panel de creación.</p>
        </div>
      ) : (
        // 🧩 MODIFICACIÓN 1: tabla más amplia, más separación y fuente más clara
        <div
          className="table-responsive mt-4"
          style={{
            overflowX: "auto",
            borderRadius: "10px",
            backgroundColor: "white",
            padding: "10px 15px",
          }}
        >
          <table
            className="table table-admin table-hover align-middle"
            style={{
              minWidth: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#041133",
                  color: "#FBFDFC",
                  borderBottom: "3px solid #0146C7",
                }}
              >
                <th style={{ padding: "15px" }}>Imagen</th>
                <th style={{ padding: "15px" }}>Nombre</th>
                <th style={{ padding: "15px" }}>Categoría</th>
                <th style={{ padding: "15px" }}>Precio</th>
                <th style={{ padding: "15px" }}>Stock</th>
                <th style={{ padding: "15px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  style={{
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    borderRadius: "10px",
                  }}
                >
                  {/* 🧩 MODIFICACIÓN 2: contenedor más ancho para imágenes */}
                  <td style={{ verticalAlign: "middle" }}>
                    {p.images && p.images.length > 0 ? (
                      <div
                        className="d-flex justify-content-center gap-2 flex-wrap"
                        style={{ maxWidth: "240px" }}
                      >
                        {p.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={
                              img.startsWith("http")
                                ? img
                                : `${BASE_URL}${img}`
                            }
                            alt={p.name}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              cursor: "pointer",
                              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                              transition: "transform 0.2s ease",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() =>
                              setSelectedImage(
                                img.startsWith("http")
                                  ? img
                                  : `${BASE_URL}${img}`
                              )
                            }
                            onError={(e) => (e.target.src = "/no-image.png")}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">Sin imagen</span>
                    )}
                  </td>

                  <td className="fw-semibold">{p.name}</td>
                  <td>{p.category || "—"}</td>
                  <td>${p.price?.toLocaleString("es-CO")}</td>
                  <td>{p.stock ?? "—"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="btn btn-admin btn-admin-danger btn-sm"
                      onClick={() => handleDelete(p._id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🖼️ Modal de vista ampliada de imágenes */}
      {selectedImage && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content p-2 bg-transparent border-0">
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="img-fluid rounded shadow-lg"
              />
              <button
                className="btn btn-light mt-3 w-100"
                onClick={() => setSelectedImage(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
