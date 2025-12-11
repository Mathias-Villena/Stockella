import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import DatasetUploadModal from "../components/DatasetUploadModal";

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
    if (!confirm("¿Eliminar esta imagen del dataset?")) return;
    await api.delete(`/dataset/${id}`);
    cargar();
  };

  return (
    <motion.div
      className="p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dataset de Entrenamiento</h1>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
        >
          + Subir Imagen
        </button>
      </div>

      {/* 🔹 Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">Total Imágenes</p>
          <h2 className="text-3xl font-bold text-purple-600">{totales.total}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">Categorías</p>
          <h2 className="text-3xl font-bold">{totales.categorias}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-gray-500 text-sm">Modelo IA</p>
          <h2 className="text-xl font-bold text-green-600">
            {totales.modelo} Activo
          </h2>
        </div>
      </div>

      {/* 🔹 Buscador */}
      <input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar etiqueta…"
        className="px-4 py-2 border rounded-xl mb-6 w-80"
      />

      {/* 🔹 Galería */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <div
            key={item.id_dataset}
            className="bg-white shadow rounded-2xl overflow-hidden"
          >
            <img
              src={item.imagen_url}
              className="w-full h-48 object-cover bg-gray-100"
            />

            <div className="p-4">
              <p className="text-purple-600 font-semibold">{item.etiqueta}</p>
              <p className="text-gray-500 text-sm">{item.fuente}</p>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">
                  {item.fecha_subida?.substring(0, 10)}
                </span>

                <button
                  onClick={() => eliminar(item.id_dataset)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Paginación */}
      <div className="flex justify-center gap-5 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="text-gray-700">
          Página {page} de {paginas}
        </span>

        <button
          disabled={page >= paginas}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-100 rounded-xl disabled:opacity-40"
        >
          Siguiente
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
