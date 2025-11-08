import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Obtener lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("❌ Error al obtener usuarios:", err);
        Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // ⚙️ Cambiar rol de usuario
  const handleRoleChange = async (id, role) => {
    const confirm = await Swal.fire({
      title: "¿Cambiar rol?",
      text: `¿Deseas cambiar el rol de este usuario a "${role}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#041133",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.patch(
        `/api/users/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );

      Swal.fire("✅ Rol actualizado", "El cambio se realizó correctamente", "success");
    } catch (err) {
      console.error("❌ Error al cambiar rol:", err);
      Swal.fire("Error", "No se pudo cambiar el rol del usuario", "error");
    }
  };

  // 🗑️ Eliminar usuario
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
      Swal.fire("Eliminado", "El usuario ha sido eliminado", "success");
    } catch (err) {
      console.error("❌ Error al eliminar usuario:", err);
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Cargando usuarios...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <h2
        className="fw-bold text-center mb-4"
        style={{ color: "#d4af37" }}
      >
        👑 Panel de Administración de Usuarios
      </h2>

      {users.length === 0 ? (
        <div className="text-center text-muted py-5">
          <h5>No hay usuarios registrados</h5>
        </div>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table align-middle table-hover">
            <thead
              style={{
                backgroundColor: "#041133",
                color: "#FBFDFC",
              }}
            >
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.role !== "admin" && (
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleRoleChange(u._id, "admin")}
                      >
                        🔑 Hacer admin
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(u._id)}
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
    </div>
  );
};

export default AdminUsers;
