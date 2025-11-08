import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProduct from "./pages/CreateProduct";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail"; // 👈 Nueva importación
import AdminUsers from "./pages/AdminUsers"; // 👈 nueva importación
import AdminProducts from "./pages/AdminProducts";
import EditProduct from "./pages/EditProduct";
import AdminDashboard from "./pages/AdminDashboard";
import MisPedidos from "./pages/MisPedidos";

function App() {
  return (
    <BrowserRouter>
      {/* 🌊 Barra superior */}
      <Navbar />

      {/* 🧭 Contenido principal */}
      <main className="flex-grow-1 py-4" style={{ backgroundColor: "#FBFDFC" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} /> {/* 👈 Nueva ruta */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />            {/* admin */}
          <Route path="/mis-pedidos" element={<MisPedidos />} />   {/* usuario */}                   
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/:id/edit" element={<EditProduct />} />   
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

        </Routes>
      </main>

      {/* ⚓ Footer fijo al final */}
      <footer
        className="text-center py-3 mt-auto"
        style={{
          backgroundColor: "#041133",
          color: "#FBFDFC",
          borderTop: "4px solid #0146C7",
        }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} <strong>Poseidón E-Commerce</strong> — Todos los derechos reservados 🌊
        </p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
