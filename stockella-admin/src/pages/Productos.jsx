import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; // 🔑 Importamos el contexto

const debounce = (fn, ms = 400) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

export default function Productos() {
  const { hasRole, user } = useAuth(); // 👈 Obtenemos los roles y datos del usuario

  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stock, setStock] = useState("all");
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);

  // 🔹 Estados para paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Obtener productos con filtros y paginación
  const fetchData = async (params = {}) => {
    const { data } = await api.get("/productos", {
      params: { page, limit, q, categoria: cat, ...params },
    });
    setItems(data.data || []);
    setTotalPages(data.paginas || 1);
  };

  // Cargar productos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Cargar categorías (mock temporal)
  useEffect(() => {
    setCategorias([
      { id: 1, nombre: "Bebidas" },
      { id: 2, nombre: "Snacks" },
      { id: 3, nombre: "Limpieza" },
    ]);
  }, []);

  // Cuando cambie categoría, resetear página
  useEffect(() => {
    setPage(1);
    fetchData({ page: 1 });
  }, [cat]);

  // 🔹 Búsqueda con debounce
  const onSearch = useMemo(
    () =>
      debounce((v) => {
        setQ(v);
        setPage(1);
        fetchData({ page: 1, q: v });
      }),
    [cat]
  );

  // 🔹 Filtrado de stock (frontend)
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

  // 🔹 Crear producto (solo Admin o Editor)
  const crear = async (form) => {
    if (!hasRole("Administrador", "Editor")) {
      alert("No tienes permisos para crear productos.");
      return;
    }

    try {
      const { data: p } = await api.post("/productos", form);

      // Subir imagen si existe
      if (file) {
        const fd = new FormData();
        fd.append("id_producto", p.id_producto);
        fd.append("comoDataset", "true");
        fd.append("file", file);

        await api.post("/upload/producto", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      reset();
      setFile(null);
      setPage(1);
      fetchData({ page: 1 });
      document.getElementById("dlg").close();
    } catch (err) {
      console.error("❌ Error creando producto:", err);
      alert("Error al crear producto");
    }
  };

  // 🔹 Navegación de páginas
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

  // 🔹 Estado visual de stock
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

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Gestión de Productos</h1>

      {/* 🔹 Mostrar el rol actual (opcional, para debug) */}
      <p className="text-sm text-gray-500 mb-2">
        Rol actual: <strong>{user?.rol}</strong>
      </p>

      {/* Filtros */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          placeholder="Buscar productos..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          className="bg-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        >
          <option value="all">Todo el stock</option>
          <option value="bajo">Stock Bajo</option>
          <option value="medio">Stock Medio</option>
          <option value="alto">Stock Alto</option>
        </select>

        {/* Solo Admin o Editor pueden crear */}
        {hasRole("Administrador", "Editor") && (
          <button
            onClick={() => document.getElementById("dlg").showModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Tarjetas de productos */}
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id_producto}
            className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-5"
          >
            {p.imagen_principal && (
              <img
                src={p.imagen_principal}
                alt={p.nombre}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            )}
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{p.nombre}</h3>

              {/* ✎ Solo Admin y Editor pueden editar */}
              {hasRole("Administrador", "Editor") && (
                <button className="text-gray-400">✎</button>
              )}
            </div>
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

      {/* Modal crear (solo Admin/Editor) */}
      {hasRole("Administrador", "Editor") && (
        <dialog id="dlg" className="rounded-2xl p-0">
          <form
            onSubmit={handleSubmit(crear)}
            className="bg-white rounded-2xl p-6 w-[520px]"
          >
            <h3 className="text-xl font-semibold mb-4">Nuevo Producto</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="bg-gray-100 px-3 py-2 rounded-lg"
                placeholder="Código"
                {...register("codigo", { required: true })}
              />
              <input
                className="bg-gray-100 px-3 py-2 rounded-lg"
                placeholder="Nombre"
                {...register("nombre", { required: true })}
              />
              <input
                className="bg-gray-100 px-3 py-2 rounded-lg"
                placeholder="Precio"
                type="number"
                step="0.01"
                {...register("precio", { required: true })}
              />
              <select
                className="bg-gray-100 px-3 py-2 rounded-lg"
                {...register("id_categoria")}
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <input
                className="bg-gray-100 px-3 py-2 rounded-lg"
                placeholder="Stock actual"
                type="number"
                {...register("stock_actual")}
              />
              <input
                className="bg-gray-100 px-3 py-2 rounded-lg"
                placeholder="Stock mínimo"
                type="number"
                {...register("stock_minimo")}
              />
            </div>
            <textarea
              className="bg-gray-100 px-3 py-2 rounded-lg w-full mt-3"
              rows="3"
              placeholder="Descripción"
              {...register("descripcion")}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-gray-100 px-3 py-2 rounded-lg w-full mt-3"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => document.getElementById("dlg").close()}
                className="px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button className="bg-[#1B59F8] hover:bg-[#174bd3] text-white px-4 py-2 rounded-lg">
                Guardar
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}
