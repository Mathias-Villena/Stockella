import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

export default function DatasetUploadModal({ open, onClose, onUploaded }) {
  const [productos, setProductos] = useState([]);
  const [idProducto, setIdProducto] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [fuente, setFuente] = useState("Admin");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchProductos = async () => {
      try {
        const { data } = await api.get("/productos", {
          params: { page: 1, limit: 100 },
        });
        setProductos(data.data || []);
      } catch (error) {
        console.error("❌ Error cargando productos:", error);
        setProductos([]);
      }
    };

    fetchProductos();
  }, [open]);

  if (!open) return null;

  const subir = async () => {
    if (!file || !idProducto) {
      Swal.fire("Campos incompletos", "Selecciona un producto y una imagen.", "warning");
      return;
    }

    setLoading(true);

    try {
      const productoSeleccionado = productos.find(
        (p) => Number(p.id_producto) === Number(idProducto)
      );

      const normalizarEtiqueta = (texto) =>
  texto
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const etiquetaFinal = normalizarEtiqueta(
  etiqueta || productoSeleccionado?.nombre || "sin_etiqueta"
);

      const form = new FormData();
      form.append("id_producto", idProducto);
      form.append("etiqueta", etiquetaFinal);
      form.append("fuente", fuente);
      form.append("comoDataset", "true");
      form.append("file", file);

      await api.post("/upload/dataset", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Éxito", "Imagen subida al dataset correctamente.", "success");

      setIdProducto("");
      setEtiqueta("");
      setFuente("Admin");
      setFile(null);

      onUploaded?.();
      onClose?.();
    } catch (error) {
      console.error("❌ Error subiendo imagen al dataset:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.error || "No se pudo subir la imagen.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[460px] shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Agregar Imagen al Dataset</h2>

        {/* Producto */}
        <label className="block text-sm mb-1 font-semibold">Producto</label>
        <select
          className="w-full px-3 py-2 border rounded-xl mb-4"
          value={idProducto}
          onChange={(e) => setIdProducto(e.target.value)}
        >
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id_producto} value={p.id_producto}>
              {p.nombre}
            </option>
          ))}
        </select>

        {/* Etiqueta */}
        <label className="block text-sm mb-1 font-semibold">Etiqueta</label>
        <input
          className="w-full px-3 py-2 border rounded-xl mb-4"
          placeholder="Ej: Coca Cola, Leche Gloria..."
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        />

        {/* Fuente */}
        <label className="block text-sm mb-1 font-semibold">Fuente</label>
        <select
          className="w-full px-3 py-2 border rounded-xl mb-4"
          value={fuente}
          onChange={(e) => setFuente(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Cámara móvil">Cámara móvil</option>
          <option value="Importación web">Importación web</option>
          <option value="Scanner código">Scanner código</option>
        </select>

        {/* Archivo */}
        <label className="block text-sm mb-1 font-semibold">Imagen</label>
        <div className="border border-dashed rounded-xl p-5 text-center mb-5">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>
          <button
            onClick={subir}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            {loading ? "Subiendo..." : "Subir Imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}