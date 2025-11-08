import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, BASE_URL, navigate }) => {
  const [loaded, setLoaded] = useState(false);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0].startsWith("http")
        ? product.images[0]
        : `${BASE_URL}${product.images[0]}`
      : "/img/no-image.png";

  const hoverImage =
    product.images && product.images.length > 1
      ? product.images[1].startsWith("http")
        ? product.images[1]
        : `${BASE_URL}${product.images[1]}`
      : mainImage;

  const safeMain = encodeURI(mainImage);
  const safeHover = encodeURI(hoverImage);

  // 🧩 Logs para depurar
  console.log("🧩 Renderizando producto:", product.name);
  console.log("➡️ Imagen principal:", safeMain);
  console.log("➡️ Imagen hover:", safeHover);

  return (
    <div key={product._id} className="col-md-4 col-lg-3 mb-4">
      <div
        className="card h-100 border-0 shadow-lg product-card"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {/* 🖼️ Contenedor de imágenes con efecto hover suave */}
        <div className="image-wrapper position-relative overflow-hidden">
          <img
            src={safeMain}
            alt={product.name}
            className={`img-main w-100 h-100 ${loaded ? "visible" : "invisible"}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => (e.currentTarget.src = "/img/no-image.png")}
          />
          <img
            src={safeHover}
            alt={`${product.name} hover`}
            className="img-hover w-100 h-100"
            onError={(e) => (e.currentTarget.src = safeMain)}
          />
        </div>

        {/* Contenido */}
        <div className="card-body text-center position-relative bg-white" style={{ zIndex: 2 }}>
          <h5 className="card-title fw-bold mb-2" style={{ color: "#041133" }}>
            {product.name}
          </h5>
          <p className="card-text text-muted small mb-2">{product.category}</p>
          <p
            className="fw-semibold mb-3"
            style={{ color: "#D4AF37", fontSize: "1.1rem" }}
          >
            ${product.price.toLocaleString("es-CO")}
          </p>
          <button
            className="btn btn-sm px-3"
            style={{
              backgroundColor: "#D4AF37",
              color: "#041133",
              border: "none",
              fontWeight: "600",
            }}
          >
            Ver detalle 👕
          </button>
        </div>
      </div>

      {/* 💅 Efectos CSS mejorados */}
      <style>{`
        .product-card {
          border-radius: 14px;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .image-wrapper {
          width: 100%;
          height: 250px;
          position: relative;
        }
        .image-wrapper img {
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
          border-radius: 14px 14px 0 0;
        }
        .img-main.visible {
          opacity: 1;
          transform: scale(1);
        }
        .img-main.invisible {
          opacity: 0;
        }
        .img-hover {
          opacity: 0;
          transform: scale(1.05);
        }
        .product-card:hover .img-main {
          opacity: 0;
          transform: scale(1.05);
        }
        .product-card:hover .img-hover {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        console.log("📦 Productos recibidos desde backend:", res.data); // 🟢 NUEVO
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Error al obtener productos:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <section
        className="text-center py-5 mb-5 shadow-sm"
        style={{
          background: "linear-gradient(90deg, #041133 0%, #0146C7 100%)",
          color: "#FBFDFC",
        }}
      >
        <div className="container">
          <h1
            className="fw-bold display-4 mb-3"
            style={{ color: "#D4AF37", letterSpacing: "1px" }}
          >
            Poseidón E-Commerce
          </h1>
          <p className="lead mb-0">
            Moda fresca, auténtica y con estilo — colección 2025 🌊
          </p>
        </div>
      </section>

      <div className="container">
        <h2
          className="text-center mb-4 fw-semibold"
          style={{ color: "#041133" }}
        >
          Catálogo Poseidón
        </h2>

        {products.length === 0 ? (
          <div className="text-center text-muted py-5">
            <h5>No hay productos disponibles todavía</h5>
            <p>Agrega productos desde el panel de administrador</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                BASE_URL={BASE_URL}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
};

export default Home;
