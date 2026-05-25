import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Agregar al Dataset</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => {
              setModo("imagen");
              setFile(null);
            }}
            className={`py-2 rounded-xl border font-semibold ${
              modo === "imagen"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700"
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
            className={`py-2 rounded-xl border font-semibold ${
              modo === "zip"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700"
            }`}
          >
            ZIP masivo
          </button>
        </div>

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

        <label className="block text-sm mb-1 font-semibold">Etiqueta</label>
        <input
          className="w-full px-3 py-2 border rounded-xl mb-4"
          placeholder="Ej: inca_kola, marsella..."
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        />

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

        <label className="block text-sm mb-1 font-semibold">
          {modo === "zip" ? "Archivo ZIP" : "Imagen"}
        </label>

        <div className="border border-dashed rounded-xl p-5 text-center mb-5">
          <input
            type="file"
            accept={modo === "zip" ? ".zip" : "image/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {modo === "zip" && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm text-purple-700 mb-5">
            Todas las imágenes del ZIP se guardarán con la etiqueta indicada.
            Puedes incluir .jpg, .jpeg, .png o .webp.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>

          <button
            onClick={subir}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
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