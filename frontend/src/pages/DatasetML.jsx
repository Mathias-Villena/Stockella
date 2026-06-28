import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import DatasetUploadModal from "../components/DatasetUploadModal";
import { Search, Plus, Trash2, Cpu, Image as ImageIcon, Database } from "lucide-react";
import Swal from "sweetalert2";
import { playClick, playSuccess } from "../utils/sound";

export default function DatasetML() {
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [paginas, setPaginas] = useState(1);

  const [modalOpen, setModalOpen] = useState(false); // ✅ AHORA SÍ

  const [totales, setTotales] = useState({
    total: 0,
    categorias: 0,
    modelo: "v2.1",
  });

  // 🔵 Cargar dataset + datos resumen
  const cargar = useCallback(async () => {
    const r = await api.get("/dataset", {
      params: { q: filtro, page },
    });

    setData(r.data.data);
    setPaginas(r.data.paginas);
    setTotales({
      total: r.data.total,
      categorias: r.data.categorias,
      modelo: r.data.modelo,
    });
  }, [filtro, page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // 🔴 Eliminar una imagen
  const eliminar = async (id) => {
    playClick();
    const result = await Swal.fire({
      title: "¿Eliminar imagen?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#94A3B8",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/dataset/${id}`);
        playSuccess();
        Swal.fire("Eliminado", "La imagen fue eliminada del dataset.", "success");
        cargar();
      } catch (error) {
        console.error("❌ Error al eliminar del dataset:", error);
        Swal.fire("Error", "No se pudo eliminar la imagen.", "error");
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🔹 Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Dataset de <span className="premium-gradient-text">Entrenamiento</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Imágenes y muestras etiquetadas para el entrenamiento del modelo de IA</p>
        </div>

        <button
          onClick={() => {
            playClick();
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-purple-500/10 cursor-pointer transition text-sm w-full md:w-auto justify-center active:scale-95 duration-100"
        >
          <Plus size={18} />
          Subir Imagen
        </button>
      </div>

      {/* 🔹 Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border-y border-r border-slate-100/85 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg glow-blue flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Imágenes</p>
            <h2 className="text-3xl font-black text-slate-800 mt-2">{totales.total}</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm">
            <ImageIcon size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-y border-r border-slate-100/85 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg glow-emerald flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categorías de IA</p>
            <h2 className="text-3xl font-black text-slate-800 mt-2">{totales.categorias}</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-y border-r border-slate-100/85 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg glow-amber flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modelo IA Activo</p>
            <h2 className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm w-fit">
              {totales.modelo} Activo
            </h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
            <Cpu size={20} />
          </div>
        </div>
      </div>

      {/* 🔹 Buscador */}
      <div className="relative w-80 max-w-full">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por etiqueta..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* 🔹 Galería */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <div
            key={item.id_dataset}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="aspect-[4/3] w-full bg-slate-50 border-b border-slate-100 overflow-hidden relative flex items-center justify-center">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.etiqueta}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300/f8fafc/cbd5e1?text=Muestra+No+Disponible";
                    }}
                  />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
                
                {/* Botón eliminar flotante en hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => eliminar(item.id_dataset)}
                    className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur shadow flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-100 cursor-pointer transition"
                    title="Eliminar del dataset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100 uppercase tracking-wide">
                    {item.etiqueta}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Fuente: <strong className="text-slate-500">{item.fuente}</strong></span>
                  <span className="font-medium">
                    {item.fecha_subida?.substring(0, 10)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-sm">
            <ImageIcon size={48} className="text-slate-300 stroke-[1.25]" />
            <p className="font-semibold text-sm">No se encontraron imágenes</p>
            <p className="text-xs text-slate-400">Prueba ajustando el campo de búsqueda</p>
          </div>
        )}
      </div>

      {/* 🔹 Paginación */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => {
            playClick();
            setPage(page - 1);
          }}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95 duration-100"
        >
          « Anterior
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Página {page} de {paginas}
        </span>

        <button
          disabled={page >= paginas}
          onClick={() => {
            playClick();
            setPage(page + 1);
          }}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95 duration-100"
        >
          Siguiente »
        </button>
      </div>

      {/* 🔹 MODAL DE SUBIDA */}
      <DatasetUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={cargar}
      />
    </motion.div>
  );
}
