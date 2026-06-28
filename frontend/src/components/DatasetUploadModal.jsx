import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { playClick, playSuccess } from "../utils/sound";

export default function DatasetUploadModal({ open, onClose, onUploaded }) {
  const [productos, setProductos] = useState([]);
  const [idProducto, setIdProducto] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [fuente, setFuente] = useState("Admin");
  const [file, setFile] = useState(null);
  const [modo, setModo] = useState("imagen");
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

  const normalizarEtiqueta = (texto) =>
    String(texto || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const subir = async () => {
    if (!file || !idProducto) {
      Swal.fire(
        "Campos incompletos",
        modo === "zip"
          ? "Selecciona un producto y un archivo ZIP."
          : "Selecciona un producto y una imagen.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const productoSeleccionado = productos.find(
        (p) => Number(p.id_producto) === Number(idProducto)
      );

      const etiquetaFinal = normalizarEtiqueta(
        etiqueta || productoSeleccionado?.nombre || "sin_etiqueta"
      );

      const form = new FormData();
      form.append("id_producto", idProducto);
      form.append("etiqueta", etiquetaFinal);
      form.append("fuente", fuente);
      form.append("file", file);

      if (modo === "zip") {
        const { data } = await api.post("/upload/dataset/zip", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        playSuccess();
        Swal.fire({
          icon: data.errores?.length ? "warning" : "success",
          title: "Dataset importado",
          html: `
            <p><b>Total archivos:</b> ${data.total}</p>
            <p><b>Imágenes subidas:</b> ${data.subidas}</p>
            <p><b>Errores:</b> ${data.errores?.length || 0}</p>
          `,
        });
      } else {
        form.append("comoDataset", "true");

        await api.post("/upload/dataset", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        playSuccess();
        Swal.fire("Éxito", "Imagen subida al dataset correctamente.", "success");
      }

      setIdProducto("");
      setEtiqueta("");
      setFuente("Admin");
      setFile(null);
      setModo("imagen");

      onUploaded?.();
      onClose?.();
    } catch (error) {
      console.error("❌ Error subiendo dataset:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.error || "No se pudo subir al dataset.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-[500px] border border-slate-100 shadow-2xl animate-modalUp">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight">Agregar al Dataset</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => {
              setModo("imagen");
              setFile(null);
            }}
            className={`py-2 px-4 rounded-xl border font-bold text-sm transition cursor-pointer ${
              modo === "imagen"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/10"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Imagen única
          </button>

          <button
            type="button"
            onClick={() => {
              setModo("zip");
              setFile(null);
            }}
            className={`py-2 px-4 rounded-xl border font-bold text-sm transition cursor-pointer ${
              modo === "zip"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/10"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            ZIP masivo
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Producto</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 cursor-pointer"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Etiqueta</label>
            <input
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400"
              placeholder="Ej: inca_kola, marsella..."
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fuente</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 cursor-pointer"
              value={fuente}
              onChange={(e) => setFuente(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Cámara móvil">Cámara móvil</option>
              <option value="Importación web">Importación web</option>
              <option value="Scanner código">Scanner código</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              {modo === "zip" ? "Archivo ZIP" : "Imagen"}
            </label>
            <div className="border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition rounded-xl p-5 text-center cursor-pointer relative overflow-hidden flex items-center justify-center">
              <input
                type="file"
                accept={modo === "zip" ? ".zip" : "image/*"}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span className="text-xs font-semibold text-slate-500">
                {file ? `✓ ${file.name}` : `Seleccionar ${modo === "zip" ? "ZIP" : "Imagen"}`}
              </span>
            </div>
          </div>
        </div>

        {modo === "zip" && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700 mb-6 leading-relaxed">
            <strong>Nota:</strong> Todas las imágenes del ZIP se guardarán con la etiqueta indicada.
            Formatos soportados: .jpg, .jpeg, .png o .webp.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm cursor-pointer transition"
          >
            Cancelar
          </button>

          <button
            onClick={subir}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/10 cursor-pointer transition disabled:opacity-50"
          >
            {loading
              ? "Subiendo..."
              : modo === "zip"
              ? "Subir ZIP"
              : "Subir Imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}