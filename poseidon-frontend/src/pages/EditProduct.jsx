import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/admin.css";

const BASE_URL = "http://localhost:5000";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 0,
    featured: false,
    sizes: [{ size: "S", stock: 0 }],
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Obtener datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const product = res.data;

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          category: product.category || "",
          stock: product.stock ?? 0,
          featured: product.featured || false,
          sizes:
            product.sizes?.length > 0
              ? product.sizes
              : [{ size: "S", stock: 0 }],
        });

        if (product.images) {
          setPreviews(
            product.images.map((img) =>
              img.startsWith("http") ? img : `${BASE_URL}${img}`
            )
          );
        }
      } catch (err) {
        console.error("❌ Error al obtener producto:", err);
        Swal.fire("Error", "No se pudo cargar el producto", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 📸 Manejo de imágenes
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // 🧾 Manejo de campos generales
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🧩 MODIFICADO: Manejo de tallas con actualización automática del stock total
  const handleSizeChange = (index, field, value) => {
    const updated = [...form.sizes];
    updated[index][field] = field === "stock" ? parseInt(value) || 0 : value;

    const totalStock = updated.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0);

    setForm((prev) => ({
      ...prev,
      sizes: updated,
      stock: totalStock, // sincroniza stock general automáticamente
    }));
  };

  const addSize = () => {
    const updated = [...form.sizes, { size: "", stock: 0 }];
    const totalStock = updated.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0);
    setForm((prev) => ({ ...prev, sizes: updated, stock: totalStock }));
  };

  const removeSize = (index) => {
    const updated = form.sizes.filter((_, i) => i !== index);
    const totalStock = updated.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0);
    setForm((prev) => ({ ...prev, sizes: updated, stock: totalStock }));
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "No tienes permisos para editar productos", "error");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "sizes") formData.append("sizes", JSON.stringify(value));
      else formData.append(key, value);
    });
    images.forEach((img) => formData.append("images", img));

    try {
      await api.put(`/api/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "✅ Producto actualizado",
        text: "Los cambios se guardaron correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Error al actualizar producto:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo actualizar el producto",
        "error"
      );
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Cargando producto...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4 admin-form border-0">
        <h2 className="text-center mb-4 fw-bold" style={{ color: "#041133" }}>
          ✏️ Editar Producto
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* 🧾 Campos principales */}
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Categoría</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              {/* 🔹 Precio y Stock total */}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-semibold">
                    Stock total (automático)
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    className="form-control bg-light"
                    readOnly
                  />
                  <small className="text-muted">
                    Calculado automáticamente según las tallas.
                  </small>
                </div>

                <div className="col-md-4 mb-3 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Destacado</label>
                  </div>
                </div>
              </div>

              {/* 👕 Tallas */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tallas y Stock por talla
                </label>
                {form.sizes.map((sz, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <input
                      type="text"
                      value={sz.size}
                      onChange={(e) =>
                        handleSizeChange(i, "size", e.target.value)
                      }
                      placeholder="Talla (S, M, L...)"
                      className="form-control"
                      style={{ maxWidth: "120px" }}
                    />
                    <input
                      type="number"
                      value={sz.stock}
                      onChange={(e) =>
                        handleSizeChange(i, "stock", e.target.value)
                      }
                      placeholder="Stock"
                      className="form-control"
                      style={{ maxWidth: "120px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeSize(i)}
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={addSize}
                >
                  ➕ Agregar talla
                </button>
              </div>
            </div>

            {/* 📸 Imágenes */}
            <div className="col-md-4 text-center">
              <label className="form-label fw-semibold">Imágenes</label>
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-2">
                {previews.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`preview-${i}`}
                    className="rounded shadow-sm"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                className="form-control"
              />
            </div>
          </div>

          {/* 💾 Botones finales */}
          <div className="d-flex justify-content-center mt-4">
            <button type="submit" className="btn btn-admin btn-admin-primary me-3">
              💾 Guardar Cambios
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin/products")}
            >
              ↩️ Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
