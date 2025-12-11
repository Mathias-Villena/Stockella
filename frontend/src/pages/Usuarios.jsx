import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; // 🔑 Importamos el contexto de autenticación

const debounce = (fn, ms = 400) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

export default function Usuarios() {
  const { user, hasRole } = useAuth(); // 👈 Datos y permisos del usuario logueado

  const [items, setItems] = useState([]);
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("all");
  const [q, setQ] = useState("");

  // 🔹 Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Cargar usuarios (solo Admin puede)
  const load = async (params = {}) => {
    if (!hasRole("Administrador")) return;
    const { data } = await api.get("/usuarios", {
      params: { page, limit, q, ...params },
    });
    setItems(data.data || []);
    setTotalPages(data.paginas || 1);
  };

  // Cargar inicial
  useEffect(() => {
    if (hasRole("Administrador")) load();
  }, []);

  // Búsqueda con debounce
  const onSearch = useMemo(
    () =>
      debounce((v) => {
        setQ(v);
        setPage(1);
        load({ page: 1, q: v });
      }),
    []
  );

  // Actualizar al cambiar rol o estado
  useEffect(() => {
    if (hasRole("Administrador")) {
      setPage(1);
      load({ page: 1 });
    }
  }, [rol, estado]);

  // Paginación
  const prev = () => {
    if (page > 1) {
      const p = page - 1;
      setPage(p);
      load({ page: p });
    }
  };
  const next = () => {
    if (page < totalPages) {
      const p = page + 1;
      setPage(p);
      load({ page: p });
    }
  };

  // Filtrado local (opcional)
  const filtered = items.filter((u) => {
    if (rol && u.Rol?.nombre !== rol) return false;
    if (estado !== "all" && (estado === "activo" ? !u.estado : u.estado))
      return false;
    return true;
  });

  // 🧩 Restricción visual por rol
  if (!hasRole("Administrador")) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          🚫 Acceso restringido
        </h2>
        <p className="text-gray-500 text-lg">
          Lo sentimos, <strong>{user?.rol}</strong> no tiene permisos para
          gestionar usuarios.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Gestión de Usuarios</h1>
      <p className="text-sm text-gray-500 mb-3">
        Rol actual: <strong>{user?.rol}</strong>
      </p>

      {/* 🔹 Filtros */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          placeholder="Buscar por nombre o email..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option>Administrador</option>
          <option>Editor</option>
          <option>Visualizador</option>
          <option>Empleado</option>
        </select>
        <select
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* 🔹 Tabla */}
      <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id_usuario} className="border-t hover:bg-gray-50">
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.Rol?.nombre}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.estado
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500 italic"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Controles de paginación */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={prev}
          disabled={page <= 1}
          className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
        >
          « Anterior
        </button>
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={next}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
        >
          Siguiente »
        </button>
      </div>
    </div>
  );
}
