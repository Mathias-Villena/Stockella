import { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { playClick, playSuccess } from "../utils/sound";

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

      playSuccess();
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
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={importar}
        className="bg-white w-[560px] rounded-3xl border border-slate-100 shadow-2xl p-6 animate-modalUp flex flex-col gap-4"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Importar Productos
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Sube un Excel con los productos y opcionalmente un archivo ZIP con las imágenes correspondientes.
          </p>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 space-y-2 leading-relaxed">
          <p className="font-bold">📋 Columnas recomendadas en Excel:</p>
          <p className="font-mono bg-blue-100/50 p-1.5 rounded-lg text-[10px] break-all">
            codigo, nombre, descripcion, precio, stock_actual, stock_minimo, unidad_medida, categoria, imagen_url, imagen_archivo
          </p>

          <p className="font-bold pt-1">🖼️ Imágenes en ZIP:</p>
          <p>
            Usa como nombre de imagen el código del producto (ej. <code className="font-mono text-[10px] bg-blue-100/50 px-1 rounded">7750001000021.jpg</code>) o coloca el nombre exacto de la foto en la columna <code className="font-mono text-[10px] bg-blue-100/50 px-1 rounded">imagen_archivo</code>.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Archivo Excel (.xlsx, .xls)
            </label>
            <div className="border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition rounded-xl p-4 text-center cursor-pointer relative overflow-hidden flex items-center justify-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setExcel(e.target.files?.[0] || null)}
              />
              <span className="text-xs font-semibold text-slate-500">
                {excel ? `✓ ${excel.name}` : "Seleccionar archivo Excel"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              ZIP de imágenes (opcional)
            </label>
            <div className="border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition rounded-xl p-4 text-center cursor-pointer relative overflow-hidden flex items-center justify-center">
              <input
                type="file"
                accept=".zip"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setZip(e.target.files?.[0] || null)}
              />
              <span className="text-xs font-semibold text-slate-500">
                {zip ? `✓ ${zip.name}` : "Seleccionar archivo ZIP"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-2 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition text-center"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/10 cursor-pointer transition disabled:opacity-50 text-center"
          >
            {loading ? "Importando..." : "Importar"}
          </button>
        </div>
      </form>
    </div>
  );
}