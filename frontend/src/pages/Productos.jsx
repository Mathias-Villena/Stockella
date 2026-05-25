import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductoModal from "../components/ProductoModal";
import ImportarProductosModal from "../components/ImportarProductosModal";
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
  const [openImport, setOpenImport] = useState(false);

  const fetchData = async (params = {}) => {
    const finalParams = {
      page,
      limit,
      q,
      categoria: cat || undefined,
      ...params,
    };

    const { data } = await api.get("/productos", { params: finalParams });

    setItems(data.data || []);
    setTotalPages(data.paginas || 1);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await api.get("/categorias");
        setCategorias(data || []);
      } catch (error) {
        console.error("❌ Error cargando categorías:", error);
        setCategorias([]);
      }
    };

    fetchCategorias();
  }, []);

  const onSearch = useMemo(
    () =>
      debounce((v) => {
        setQ(v);
        setPage(1);
        fetchData({ page: 1, q: v });
      }),
    [cat, page]
  );

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

  const handleNuevo = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditarProducto = (producto) => {
    setEditingProduct(producto);
    setShowModal(true);
  };

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

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Gestión de Productos</h1>
          <p className="text-sm text-gray-500">
            Rol actual: <strong>{user?.rol}</strong>
          </p>
        </div>

        {hasRole("Administrador", "Editor") && (
          <div className="flex gap-3">
            <button
              onClick={() => setOpenImport(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow"
            >
              Importar Excel
            </button>

            <button
              onClick={handleNuevo}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold shadow"
            >
              + Nuevo Producto
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
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
            setPage(1);
            fetchData({ page: 1, categoria: value || undefined });
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id_categoria || c.id} value={c.id_categoria || c.id}>
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
      </div>

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
                Stock: {p.stock_actual} {p.unidad_medida || "unidades"}
              </span>
              {badge(p)}
            </div>
          </div>
        ))}
      </div>

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

      {showModal && (
        <ProductoModal
          producto={editingProduct}
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onCreated={() => fetchData({ page })}
        />
      )}

      <ImportarProductosModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImported={() => fetchData({ page: 1 })}
      />
    </div>
  );
}