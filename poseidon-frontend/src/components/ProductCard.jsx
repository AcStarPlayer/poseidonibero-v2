import React from "react";
import { useCart } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{
        borderRadius: "14px",
        overflow: "hidden",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src={`http://localhost:5000${product.imageUrl}`}
        alt={product.name}
        className="card-img-top"
        style={{
          objectFit: "cover",
          height: "250px",
        }}
      />
      <div className="card-body text-center">
        <h5 className="fw-bold" style={{ color: "#041133" }}>
          {product.name}
        </h5>
        <p className="text-muted small">{product.category}</p>
        <p
          className="fw-semibold mb-3"
          style={{ color: "#D4AF37", fontSize: "1.1rem" }}
        >
          ${product.price.toLocaleString("es-CO")}
        </p>
        <button
          className="btn w-100 py-2"
          style={{
            backgroundColor: "#D4AF37",
            color: "#041133",
            border: "none",
            fontWeight: "600",
          }}
          onClick={() => addToCart(product)}
        >
          🛒 Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
