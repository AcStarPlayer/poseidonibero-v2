import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:5000"; // 🧩 Asegura consistencia

const Cart = () => {
  const { cart, removeFromCart, clearCart, createOrder, getTotal } = useCart();
  const [address, setAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleOrder = async () => {
    if (!address.fullName || !address.address || !address.city || !address.phone) {
      return Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los datos de envío.",
      });
    }

    try {
      const confirm = await Swal.fire({
        title: "¿Confirmar pedido?",
        text: "Tu pedido será enviado con pago contra entrega.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#0146C7",
      });

      if (confirm.isConfirmed) {
        await createOrder(address);
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al crear el pedido",
        text: "Ocurrió un problema, intenta nuevamente.",
      });
    }
  };

  if (!cart || cart.length === 0)
    return (
      <div className="text-center mt-5">
        <h4 className="text-muted mb-3">Tu carrito está vacío 🛍️</h4>
        <a href="/" className="btn btn-primary">
          Volver al catálogo
        </a>
      </div>
    );

  console.log("🧾 Carrito actual:", cart);

  return (
    <div className="container mt-4">
      <h2 className="text-primary fw-bold mb-4 text-center">🛒 Tu Carrito</h2>

      {/* 🔹 BLOQUE DE PRODUCTOS */}
      <div className="row">
        {cart.map((item, index) => {
          console.log(`📦 Producto #${index + 1}:`, item.name);
          console.log("➡️ ID:", item.product);
          console.log("➡️ Clave única:", item.uniqueKey); // 🟢 Nueva línea de log
          console.log("➡️ Imágenes recibidas:", item.images);

          const mainImage =
            item.images && item.images.length > 0
              ? item.images[0].startsWith("http")
                ? item.images[0]
                : `${BASE_URL}${item.images[0]}`
              : "/no-image.png";

          return (
            // 🟢 Clave única por producto+talla
            <div key={item.uniqueKey} className="col-12 mb-5">
              <div className="row align-items-center shadow-sm border rounded p-4 bg-white">
                {/* 🖼️ Imagen principal y miniaturas */}
                <div className="col-md-5 text-center">
                  {item.images && item.images.length > 0 ? (
                    <>
                      <img
                        src={mainImage}
                        alt={item.name}
                        className="img-fluid rounded shadow-sm mb-3"
                        style={{
                          maxHeight: "350px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onError={(e) => {
                          console.warn("❌ Error al cargar imagen:", mainImage);
                          e.target.src = "/no-image.png";
                        }}
                        onClick={() => setSelectedImage(mainImage)}
                      />

                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        {item.images.slice(1, 4).map((thumb, idx) => {
                          const thumbUrl = thumb.startsWith("http")
                            ? thumb
                            : `${BASE_URL}${thumb}`;
                          return (
                            <img
                              key={idx}
                              src={thumbUrl}
                              alt="miniatura"
                              style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: "1px solid #ddd",
                              }}
                              onClick={() => setSelectedImage(thumbUrl)}
                              onError={(e) => {
                                console.warn("❌ Error miniatura:", thumbUrl);
                                e.target.src = "/no-image.png";
                              }}
                            />
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted">Sin imagen</div>
                  )}
                </div>

                {/* 🧾 Detalle del producto */}
                <div className="col-md-7">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      {/* 🟢 Nombre del producto */}
                      <h4 className="fw-bold text-dark mb-1">{item.name}</h4>

                      {/* 🟢 NUEVO: Mostrar la talla debajo del nombre */}
                      {item.customization?.size && (
                        <p className="text-muted mb-2">
                          <strong>Talla:</strong> {item.customization.size}
                        </p>
                      )}

                      {/* 🟢 Descripción */}
                      {item.description && (
                        <p
                          className="text-secondary mb-2"
                          style={{ fontSize: "0.95rem", lineHeight: "1.4" }}
                        >
                          {item.description.length > 150
                            ? item.description.slice(0, 150) + "..."
                            : item.description}
                        </p>
                      )}

                      {/* 🟢 Cantidad */}
                      <p className="text-muted mb-1">
                        <strong>Cantidad:</strong> {item.quantity}
                      </p>

                      {/* 🟢 Precio individual */}
                      <p className="fw-semibold text-primary fs-5 mb-1">
                        ${item.price.toLocaleString("es-CO")}
                      </p>

                      {/* 🟢 Subtotal */}
                      <p className="fw-bold text-success fs-6 mt-2">
                        Subtotal: ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </p>
                    </div>

                    {/* ❌ Botón eliminar */}
                    <button
                      onClick={() => removeFromCart(item.uniqueKey)}
                      className="btn btn-outline-danger btn-sm ms-2"
                      title="Eliminar este producto"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {/* 🔹 Línea divisoria sutil para separar productos */}
                  <hr style={{ borderTop: "1px dashed #ccc", margin: "1rem 0" }} />
                </div>



              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 TOTAL Y BOTONES */}
      <div className="mt-4 text-center">
        <h4 className="text-success fw-bold">
          Total: ${getTotal().toLocaleString("es-CO")}
        </h4>
        <button onClick={clearCart} className="btn btn-outline-secondary me-2">
          Vaciar carrito
        </button>
      </div>

      {/* 🔹 DATOS DE ENVÍO */}
      <div className="mt-5">
        <h5 className="fw-semibold mb-3">Datos de envío</h5>
        <div className="row">
          {["fullName", "phone", "city", "address"].map((field, idx) => (
            <div className="col-md-6 mb-3" key={idx}>
              <input
                className="form-control"
                placeholder={
                  field === "fullName"
                    ? "Nombre completo"
                    : field === "phone"
                    ? "Teléfono"
                    : field === "city"
                    ? "Ciudad"
                    : "Dirección"
                }
                onChange={(e) =>
                  setAddress({ ...address, [field]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={handleOrder} className="btn btn-primary btn-lg px-5">
            🧾 Confirmar pedido
          </button>
        </div>
      </div>

      {/* 🟢 MODAL para ver imagen en grande */}
      {selectedImage && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content p-3 bg-transparent border-0 text-center">
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

export default Cart;
