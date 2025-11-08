import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./navbar.css";

// 🧭 INFO DE ENTORNO (solo visible en consola para debug)
console.log("🌍 Entorno actual:", process.env.NODE_ENV);
console.log("🔗 Backend conectado a:", process.env.REACT_APP_API_URL || "http://localhost:5000");


const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 🧩 MODIFICADO: agregar normalizador de rol
  console.log("🧭 Navbar render - Usuario actual:", user);
  const normalizedRole =
    user?.role === "cliente" ? "user" : user?.role || "guest";

  const isActive = (path) =>
    location.pathname === path ? "text-warning fw-semibold" : "text-light";

  // 🧩 MODIFICADO: cambiar condición para usar normalizedRole
  if (!user) {
    return (
      <nav
        className="navbar navbar-expand-lg shadow-sm fixed-top py-3"
        style={{
          backgroundColor: "#041133",
          color: "#FBFDFC",
          borderBottom: "3px solid #0146C7",
          letterSpacing: "0.5px",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center px-4">
          {/* 🔱 LOGO */}
          <Link
            to="/"
            className="fw-bold text-decoration-none"
            style={{
              color: "#D4AF37",
              fontSize: "1.4rem",
              letterSpacing: "1px",
            }}
          >
            Poseidón 🌊
          </Link>

          {/* 🧭 LINKS CENTRALES */}
          <ul
            className="navbar-nav mx-auto d-none d-lg-flex"
            style={{
              gap: "2rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <li>
              <Link className="nav-link text-light" to="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="nav-link text-light" to="/catalogo">
                Catálogo
              </Link>
            </li>
            <li>
              <Link className="nav-link text-light" to="/nosotros">
                Quiénes somos
              </Link>
            </li>
            <li>
              <Link className="nav-link text-light" to="/contacto">
                Contacto
              </Link>
            </li>
          </ul>

          {/* ⚙️ ICONOS DERECHA */}
          <div
            className="d-flex align-items-center"
            style={{ gap: "1.5rem" }}
          >
            {/* 🔍 Buscar */}
            <i
              className="bi bi-search text-light"
              style={{ cursor: "pointer", fontSize: "1.1rem" }}
              onClick={() => navigate("/buscar")}
              title="Buscar"
            ></i>

            {/* 👤 Iniciar sesión */}
            <button
              onClick={() => navigate("/login")}
              className="btn btn-outline-light btn-sm px-3"
              style={{
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              Iniciar sesión
            </button>

            {/* ✨ Botón Registrarse dorado */}
            <button
              onClick={() => navigate("/register")}
              className="btn btn-warning btn-sm px-3 text-dark fw-semibold"
              style={{
                fontWeight: 700,
                backgroundColor: "#D4AF37",
                border: "none",
              }}
            >
              Registrarse
            </button>

            {/* 🛒 Carrito */}
            <i
              className="bi bi-cart3 text-light"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => navigate("/cart")}
              title="Carrito"
            ></i>
          </div>
        </div>

        <style>{`
          .nav-link {
            transition: color 0.3s ease;
          }
          .nav-link:hover {
            color: #D4AF37 !important;
          }
        `}</style>
      </nav>
    );
  }

  // 🧩 MODIFICADO: el bloque admin sigue igual, solo usamos normalizedRole
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm fixed-top"
      style={{
        backgroundColor: "#041133",
        borderBottom: "3px solid #0146C7",
      }}
    >
      <div className="container">
        {/* 🌊 Logo / Marca */}
        <Link
          to="/"
          className="navbar-brand fw-bold"
          style={{ color: "#AFCEE2", fontSize: "1.4rem", letterSpacing: "1px" }}
        >
          Poseidón 🌊
        </Link>

        {/* 🔽 Botón colapsable (mobile) */}
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 🔗 Enlaces */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* 🛍️ Productos */}
            <li className="nav-item me-3">
              <Link to="/" className={`nav-link ${isActive("/")}`}>
                Productos
              </Link>
            </li>

            {/* 🛒 Carrito */}
            <li className="nav-item me-3">
              <Link to="/cart" className={`nav-link ${isActive("/cart")}`}>
                Carrito 🛒
              </Link>
            </li>

            {/* ➕ Crear Producto visible solo para admin */}
            {normalizedRole === "admin" && (
              <li className="nav-item me-3">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate("/create-product")}
                >
                  ➕ Crear Producto
                </button>
              </li>
            )}

            {/* 📦 Gestionar Productos visible solo para admin */}
            {normalizedRole === "admin" && (
              <li className="nav-item me-3">
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => navigate("/admin/products")}
                >
                  📦 Gestionar Productos
                </button>
              </li>
            )}

            {/* 👤 Usuario autenticado */}
            {user ? (
              <>
                <li className="nav-item me-3 text-light">
                  Bienvenido, <strong>{user.name}</strong>
                </li>

                {/* ⚙️ Panel Admin */}
                {normalizedRole === "admin" && (
                  <li className="nav-item dropdown me-3">
                    <button
                      className="btn btn-warning btn-sm dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Panel Admin ⚙️
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow"
                      aria-labelledby="adminDropdown"
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => navigate("/admin/dashboard")}
                        >
                          📊 Dashboard Admin
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => navigate("/create-product")}
                        >
                          🛍️ Crear Producto
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => navigate("/admin/products")}
                        >
                          📦 Gestionar Productos
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => navigate("/admin/users")}
                        >
                          👤 Usuarios
                        </button>
                      </li>
                    </ul>
                  </li>
                )}

                {/* 📦 Mis pedidos */}
                <li className="nav-item me-3">
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() =>
                      normalizedRole === "admin"
                        ? navigate("/orders")
                        : navigate("/mis-pedidos")
                    }
                  >
                    Mis pedidos
                  </button>
                </li>

                {/* 🔒 Cerrar sesión */}
                <li className="nav-item">
                  <button className="btn btn-danger btn-sm" onClick={logout}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* 🚪 Iniciar sesión / Registro */}
                <li className="nav-item me-2">
                  <Link
                    to="/login"
                    className="btn btn-outline-light btn-sm px-3"
                  >
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="btn btn-warning btn-sm px-3 text-dark fw-semibold"
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
