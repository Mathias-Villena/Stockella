import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductoModal from "../components/ProductoModal";
import Swal from "sweetalert2";

const debounce = (fn, ms = 400) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

export default function Productos() {
  const { hasRole, user } = useAuth();

  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stock, setStock] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ===============================
  // Cargar productos
  // ===============================
  const fetchData = async (params = {}) => {
    const { data } = await api.get("/productos", {
      params: { page, limit, q, categoria: cat || undefined, ...params },
    });
    setItems(data.data || []);
    setTotalPages(data.paginas || 1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===============================
  // Cargar categorías (mock temporal)
  // ===============================
  useEffect(() => {
    setCategorias([
      { id: 1, nombre: "Bebidas" },
      { id: 2, nombre: "Snacks" },
      { id: 3, nombre: "Limpieza" },
    ]);
  }, []);

  // ===============================
  // Búsqueda con debounce
  // ===============================
  const onSearch = useMemo(
    () =>
      debounce((v) => {
        setQ(v);
        setPage(1);
        fetchData({ page: 1, q: v });
      }),
    [cat]
  );

  // ===============================
  // Filtrar por stock (frontend)
  // ===============================
  const filtered = items.filter((p) => {
    if (stock === "bajo" && !(p.stock_actual <= p.stock_minimo)) return false;
    if (
      stock === "medio" &&
      !(p.stock_actual > p.stock_minimo && p.stock_actual - p.stock_minimo < 30)
    )
      return false;
    if (stock === "alto" && !(p.stock_actual - p.stock_minimo >= 30))
      return false;
    return true;
  });

  // ===============================
  // Paginación
  // ===============================
  const prev = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchData({ page: newPage });
    }
  };

  const next = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchData({ page: newPage });
    }
  };

  // ===============================
  // Badges de stock
  // ===============================
  const badge = (p) => {
    if (p.stock_actual <= p.stock_minimo)
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
          Stock Bajo
        </span>
      );
    if (p.stock_actual - p.stock_minimo < 30)
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          Stock Medio
        </span>
      );
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
        Stock Alto
      </span>
    );
  };

  // ===============================
  // Crear o editar
  // ===============================
  const handleNuevo = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditarProducto = (producto) => {
    setEditingProduct(producto);
    setShowModal(true);
  };

  // ===============================
  // Eliminar producto
  // ===============================
  const handleEliminarProducto = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/productos/${id}`);
      Swal.fire("Eliminado", "El producto fue eliminado correctamente.", "success");
      fetchData({ page });
    } catch (err) {
      console.error("❌ Error eliminando producto:", err);
      Swal.fire("Error", "No se pudo eliminar el producto.", "error");
    }
  };

  // ===============================
  // Render principal
  // ===============================
  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Gestión de Productos</h1>
      <p className="text-sm text-gray-500 mb-2">
        Rol actual: <strong>{user?.rol}</strong>
      </p>

      {/* FILTROS */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          className="bg-white px-4 py-3 rounded-xl shadow"
          placeholder="Buscar productos..."
          onChange={(e) => onSearch(e.target.value)}
        />

        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={cat}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : "";
            setCat(value);
            fetchData({ page: 1, categoria: value });
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        >
          <option value="all">Todo el stock</option>
          <option value="bajo">Stock Bajo</option>
          <option value="medio">Stock Medio</option>
          <option value="alto">Stock Alto</option>
        </select>

        {hasRole("Administrador", "Editor") && (
          <button
            onClick={handleNuevo}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* TARJETAS */}
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id_producto}
            className="bg-white rounded-2xl shadow p-5 relative"
          >
            {p.imagen_principal && (
              <img
                src={p.imagen_principal}
                alt={p.nombre}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            )}

            <div className="absolute top-3 right-3 flex gap-2">
              {hasRole("Administrador", "Editor") && (
                <button
                  onClick={() => handleEditarProducto(p)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Editar producto"
                >
                  ✎
                </button>
              )}
              {hasRole("Administrador") && (
                <button
                  onClick={() => handleEliminarProducto(p.id_producto)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar producto"
                >
                  🗑️
                </button>
              )}
            </div>

            <h3 className="font-semibold">{p.nombre}</h3>
            <p className="text-sm text-gray-500 mb-2">
              {p.descripcion || "Sin descripción"}
            </p>
            <p className="font-semibold text-emerald-600">
              S/ {Number(p.precio).toFixed(2)}
            </p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                Stock: {p.stock_actual} unidades
              </span>
              {badge(p)}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
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

      {/* MODAL */}
      {showModal && (
        <ProductoModal
          producto={editingProduct}
          onClose={() => setShowModal(false)}
          onCreated={() => fetchData({ page })}
        />
      )}
    </div>
  );
}
