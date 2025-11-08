import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../contexts/CartContext";

const BASE_URL = "http://localhost:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ MANTENER — lógica de carga de producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const productData = res.data;

        console.log("🟢 Producto recibido del backend:", productData); // 🟢 NUEVO

        if (productData.images && productData.images.length > 0) {
          productData.images = productData.images.map((img) =>
            img.startsWith("http") ? img : `${BASE_URL}${img}`
          );
        }

        console.log("🟢 Imágenes normalizadas:", productData.images); // 🟢 NUEVO

        setProduct(productData);
      } catch (err) {
        console.error("❌ Error al cargar producto:", err);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ MANTENER — funciones del carrito
  const handleAddToCart = () => {
    if (!size) {
      alert("Por favor selecciona una talla antes de agregar al carrito.");
      return;
    }

    console.log("🟢 Producto agregado al carrito:", product); // 🟢 NUEVO

    addToCart(
      {
        ...product,
      },
      quantity,
      { size } // 🔹 Enviamos talla como parte de customization
    );

    alert("Producto agregado al carrito 🛒");
  };

  const handleBuyNow = () => {
    if (!size) {
      alert("Selecciona una talla antes de continuar.");
      return;
    }

    console.log("🟢 Compra directa:", product); // 🟢 NUEVO

    addToCart(
      {
        ...product,
      },
      quantity,
      { size }
    );

    navigate("/cart");
  };

  // ✅ MANTENER — pantalla de carga
  if (!product)
    return <div className="text-center mt-5">Cargando producto...</div>;

  // 🔸 RETORNO VISUAL COMPLETO 🔸
  return (
    // 🟢 Se agregó 'mt-5 pt-4' para bajar el contenido y evitar que quede pegado al navbar
    <div className="container py-5 mt-5 pt-4">
      <div className="row g-4">
        {/* --- Galería lateral de miniaturas --- */}
        <div className="col-md-1 d-none d-md-flex flex-column align-items-center gap-2">
          {product.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-${idx}`}
              className="img-thumbnail border-0 shadow-sm"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() =>
                document.getElementById("mainImage")?.setAttribute("src", img)
              }
              onError={(e) => {
                console.warn("⚠️ Error cargando miniatura:", img); // 🟢 NUEVO
                e.target.src = "/no-image.png";
              }}
            />
          ))}
        </div>

        {/* --- Imagen principal --- */}
        <div className="col-md-6 text-center">
          <img
            id="mainImage"
            src={product.images?.[0] || "/no-image.png"}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "480px", objectFit: "contain" }}
            onError={(e) => {
              console.warn("⚠️ Error cargando imagen principal:", product.images?.[0]); // 🟢 NUEVO
              e.target.src = "/no-image.png";
            }}
          />
        </div>

        {/* --- Panel derecho --- */}
        <div className="col-md-5">
          <h4 className="fw-bold mb-1">{product.name}</h4>
          <p className="text-muted small mb-3">{product.description}</p>

          <h3 className="fw-bold text-success mb-1">
            ${product.price?.toLocaleString("es-CO")}
          </h3>
          <p className="text-decoration-line-through text-muted small">
            ${Math.round(product.price * 1.2).toLocaleString("es-CO")}
          </p>
          <span className="badge bg-success mb-3">20% OFF</span>

          {/* --- Selector de talla --- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Talla:</label>
            <select
              className="form-select"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="">Selecciona una talla</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* --- Cantidad --- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Cantidad:</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: "120px" }}
            />
          </div>

          <p className="fw-bold text-success">
            Total: ${(product.price * quantity).toLocaleString("es-CO")}
          </p>

          <div className="d-grid gap-2 mt-4">
            <button onClick={handleBuyNow} className="btn btn-success btn-lg">
              💰 Comprar ahora
            </button>
            <button onClick={handleAddToCart} className="btn btn-warning btn-lg">
              🛒 Agregar al carrito
            </button>
          </div>

          <div className="mt-4 border-top pt-3 small text-muted">
            <p>🚚 Envío gratis a todo el país</p>
            <p>🔁 Devolución gratis por 30 días</p>
            <p>🛡️ Compra protegida por la tienda</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
