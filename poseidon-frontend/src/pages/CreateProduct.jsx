import React, { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const CreateProduct = () => {
  const { adminToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 0, // 🔹 ahora se calcula automáticamente
  });

  const [sizes, setSizes] = useState([{ size: "S", stock: 0 }]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 📸 Manejar múltiples imágenes
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      Swal.fire("Límite excedido", "Máximo 5 imágenes permitidas", "warning");
      return;
    }
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  // ➕ Agregar una talla nueva
  const addSize = () => setSizes([...sizes, { size: "", stock: 0 }]);

  // ❌ Eliminar una talla
  const removeSize = (index) => setSizes(sizes.filter((_, i) => i !== index));

  // ✏️ Editar tallas
  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = field === "stock" ? parseInt(value) || 0 : value;
    setSizes(updated);
  };

  // 🧮 CALCULAR STOCK AUTOMÁTICO CADA VEZ QUE CAMBIAN LAS TALLAS
  useEffect(() => {
    const totalStock = sizes.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0);
    setForm((prev) => ({ ...prev, stock: totalStock }));
  }, [sizes]);

  // 💾 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      fd.append("sizes", JSON.stringify(sizes));
      files.forEach((file) => fd.append("images", file));

      const tokenToUse = localStorage.getItem("adminToken") || adminToken;
      const headers = tokenToUse
        ? { Authorization: `Bearer ${tokenToUse}` }
        : {};

      await api.post("/api/products", fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "✅ Producto creado con éxito",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Error al crear producto:", err);
      Swal.fire("Error", "No se pudo crear el producto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4" style={{ color: "#041133" }}>
        ➕ Crear Nuevo Producto
      </h2>

      <form
        onSubmit={handleSubmit}
        className="p-4 shadow rounded bg-light"
        style={{ maxWidth: "700px", margin: "auto" }}
      >
        {/* 🧾 Campos principales */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del producto"
          className="form-control mb-3"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          className="form-control mb-3"
          rows="3"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Precio"
          className="form-control mb-3"
          required
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Categoría"
          className="form-control mb-3"
        />

        {/* 📦 Stock general (automático) */}
        <div className="mb-3">
          <label className="fw-semibold">Stock total (automático):</label>
          <input
            name="stock"
            type="number"
            className="form-control bg-light"
            value={form.stock}
            readOnly
          />
          <small className="text-muted">
            Se calcula automáticamente al sumar todas las tallas.
          </small>
        </div>

        {/* 📸 Subida de imágenes */}
        <div className="mb-3">
          <label className="fw-semibold">Imágenes (máx 5):</label>
          <input
            type="file"
            onChange={handleFiles}
            className="form-control"
            accept="image/*"
            multiple
          />
        </div>

        {/* Previsualización de imágenes */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="preview"
              className="img-thumbnail shadow-sm"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          ))}
        </div>

        {/* 🧍‍♂️ Stock por talla */}
        <h5 className="fw-bold mt-3 mb-2">Tallas y stock</h5>
        {sizes.map((s, i) => (
          <div key={i} className="d-flex align-items-center mb-2">
            <input
              value={s.size}
              onChange={(e) => handleSizeChange(i, "size", e.target.value)}
              placeholder="Talla (Ej: S, M, L)"
              className="form-control me-2"
              style={{ width: "120px" }}
            />
            <input
              type="number"
              value={s.stock}
              onChange={(e) => handleSizeChange(i, "stock", e.target.value)}
              placeholder="Cantidad"
              className="form-control me-2"
              style={{ width: "120px" }}
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
          className="btn btn-secondary btn-sm mb-3"
          onClick={addSize}
        >
          ➕ Agregar talla
        </button>

        {/* 💾 Botón principal */}
        <button
          className="btn btn-primary w-100"
          disabled={loading}
          style={{ backgroundColor: "#0146C7", border: "none" }}
        >
          {loading ? "Creando..." : "💾 Crear producto"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
