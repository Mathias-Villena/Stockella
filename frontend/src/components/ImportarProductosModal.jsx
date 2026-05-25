import { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function ImportarProductosModal({ open, onClose, onImported }) {
  const [excel, setExcel] = useState(null);
  const [zip, setZip] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const importar = async (e) => {
    e.preventDefault();

    if (!excel) {
      Swal.fire("Archivo requerido", "Selecciona un Excel para importar.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", excel);

    if (zip) {
      formData.append("imagenes", zip);
    }

    setLoading(true);

    try {
      const { data } = await api.post("/productos/importar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: data.errores?.length ? "warning" : "success",
        title: "Importación finalizada",
        html: `
          <p><b>Total filas:</b> ${data.total_filas}</p>
          <p><b>Creados:</b> ${data.creados}</p>
          <p><b>Errores:</b> ${data.errores?.length || 0}</p>
        `,
      });

      onImported();
      onClose();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detalle ||
          error.response?.data?.error ||
          "No se pudo importar el archivo.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={importar}
        className="bg-white w-[560px] rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Importar productos
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Sube un Excel con los productos y opcionalmente un ZIP con imágenes.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 mb-5">
          <p className="font-semibold mb-2">Columnas recomendadas:</p>
          <p>
            codigo, nombre, descripcion, precio, stock_actual, stock_minimo,
            unidad_medida, categoria, imagen_url, imagen_archivo
          </p>

          <p className="mt-3 font-semibold">Imágenes ZIP:</p>
          <p>
            Usa nombres como el código del producto: 7750001000021.jpg o coloca
            el nombre exacto en imagen_archivo.
          </p>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Archivo Excel (.xlsx, .xls)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setExcel(e.target.files?.[0] || null)}
          className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-3 mb-4"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ZIP de imágenes (opcional)
        </label>
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setZip(e.target.files?.[0] || null)}
          className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-3"
        />

        <button
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-semibold mt-6 disabled:opacity-60"
        >
          {loading ? "Importando..." : "Importar productos"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-2xl mt-3"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}