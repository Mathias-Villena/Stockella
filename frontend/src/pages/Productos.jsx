import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductoModal from "../components/ProductoModal";
import ImportarProductosModal from "../components/ImportarProductosModal";
import Swal from "sweetalert2";
import { Search, Plus, Upload, Pencil, Trash2, Package } from "lucide-react";
import { playClick } from "../utils/sound";

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
      stock: stock !== "all" ? stock : undefined,
      ...params,
    };

    if (finalParams.stock === "all") {
      delete finalParams.stock;
    }

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
        fetchData({
          page: 1,
          q: v,
          stock: stock !== "all" ? stock : undefined,
        });
      }),
    [cat, stock]
  );

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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Gestión de <span className="premium-gradient-text">Productos</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold text-slate-400">Rol de usuario:</span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide">
              {user?.rol}
            </span>
          </div>
        </div>

        {hasRole("Administrador", "Editor") && (
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                playClick();
                setOpenImport(true);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm cursor-pointer transition text-sm active:scale-95 duration-150"
            >
              <Upload size={16} />
              Importar Excel
            </button>

            <button
              onClick={() => {
                playClick();
                handleNuevo();
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm active:scale-95 duration-150"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>
          </div>
        )}
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-700 placeholder-slate-400"
            placeholder="Buscar productos por nombre..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={cat}
          onChange={(e) => {
            playClick();
            const value = e.target.value ? Number(e.target.value) : "";
            setCat(value);
            setPage(1);

            fetchData({
              page: 1,
              categoria: value || undefined,
              stock: stock !== "all" ? stock : undefined,
            });
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
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={stock}
          onChange={(e) => {
            playClick();
            const value = e.target.value;
            setStock(value);
            setPage(1);

            fetchData({
              page: 1,
              stock: value !== "all" ? value : undefined,
            });
          }}
        >
          <option value="all">Todo el stock</option>
          <option value="bajo">Stock Bajo</option>
          <option value="medio">Stock Medio</option>
          <option value="alto">Stock Alto</option>
        </select>
      </div>

      {/* REJILLA DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => {
          // Dynamic glow class by stock level
          let glowClass = "glow-blue";
          if (Number(p.stock_actual) <= Number(p.stock_minimo)) {
            glowClass = "glow-rose";
          } else if (Number(p.stock_actual) <= Number(p.stock_minimo) * 1.5) {
            glowClass = "glow-amber";
          } else if (Number(p.stock_actual) > Number(p.stock_minimo) * 1.5) {
            glowClass = "glow-emerald";
          }

          return (
            <div
              key={p.id_producto}
              className={`bg-white rounded-2xl p-5 relative flex flex-col justify-between border-y border-r border-slate-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden group ${glowClass}`}
            >
              <div>
                {/* IMAGEN DE PRODUCTO */}
                <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center relative shadow-sm">
                  {p.imagen_principal ? (
                    <img
                      src={p.imagen_principal}
                      alt={p.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300/f8fafc/cbd5e1?text=No+Disponible";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Package size={40} className="stroke-[1.5]" />
                      <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Sin Imagen</span>
                    </div>
                  )}
                  
                  {/* BOTONES ACCION FLOTANTES */}
                  <div className="absolute top-2.5 right-2.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {hasRole("Administrador", "Editor") && (
                      <button
                        onClick={() => {
                          playClick();
                          handleEditarProducto(p);
                        }}
                        className="h-8.5 w-8.5 rounded-lg bg-white/95 backdrop-blur shadow border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer active:scale-90"
                        title="Editar producto"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {hasRole("Administrador") && (
                      <button
                        onClick={() => {
                          playClick();
                          handleEliminarProducto(p.id_producto);
                        }}
                        className="h-8.5 w-8.5 rounded-lg bg-white/95 backdrop-blur shadow border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer active:scale-90"
                        title="Eliminar producto"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

              {/* DETALLES */}
              <h3 className="font-bold text-slate-800 text-base leading-snug">{p.nombre}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                {p.descripcion || "Sin descripción disponible"}
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</p>
                <p className="font-extrabold text-blue-600 text-lg mt-0.5">
                  S/ {Number(p.precio).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock actual</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-700">
                    {p.stock_actual} {p.unidad_medida || "unid."}
                  </span>
                  {badge(p)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

        {items.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-sm">
            <Package size={48} className="text-slate-300 stroke-[1.25]" />
            <p className="font-semibold text-sm">No se encontraron productos</p>
            <p className="text-xs text-slate-400">Intenta cambiar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            playClick();
            prev();
          }}
          disabled={page <= 1}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95 duration-100"
        >
          « Anterior
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() => {
            playClick();
            next();
          }}
          disabled={page >= totalPages}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95 duration-100"
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
        onImported={() => {
          setPage(1);
          fetchData({ page: 1 });
        }}
      />
    </div>
  );
}