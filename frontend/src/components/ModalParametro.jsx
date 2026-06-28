import { useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { playClick, playSuccess } from "../utils/sound";

export default function ModalParametro({ modo, data, cerrar, refrescar }) {
  const [clave, setClave] = useState(data?.clave || "");
  const [valor, setValor] = useState(data?.valor || "");
  const [descripcion, setDescripcion] = useState(data?.descripcion || "");
  const [loading, setLoading] = useState(false);

  const guardar = async (e) => {
    if (e) e.preventDefault();

    if (!clave.trim() || !valor.trim()) {
      Swal.fire("Campos requeridos", "La clave y el valor son obligatorios.", "warning");
      return;
    }

    setLoading(true);
    try {
      if (modo === "crear") {
        await api.post("/configuracion", { clave, valor, descripcion });
        playSuccess();
        Swal.fire("Registrado", "Parámetro configurado correctamente.", "success");
      } else {
        await api.put(`/configuracion/${data.id_config}`, { clave, valor, descripcion });
        playSuccess();
        Swal.fire("Actualizado", "Parámetro actualizado correctamente.", "success");
      }
      refrescar();
      cerrar();
    } catch (error) {
      console.error("❌ Error guardando parámetro:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "No se pudo guardar la configuración.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
      <form
        onSubmit={guardar}
        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xl w-[450px] animate-modalUp flex flex-col gap-4"
      >
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {modo === "crear" ? "Agregar Parámetro" : "Editar Parámetro"}
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Clave</label>
          <input
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 font-semibold"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej: LIMITE_STOCK_MIN"
            disabled={modo !== "crear"}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Valor</label>
          <input
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 font-semibold"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ej: 10"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
          <textarea
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 h-24 resize-none leading-relaxed"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Límite global mínimo para alertas de inventario bajo."
          />
        </div>

        <div className="flex gap-3 mt-2 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={() => {
              playClick();
              cerrar();
            }}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer transition disabled:opacity-50 text-center"
          >
            {loading ? "Guardando..." : modo === "crear" ? "Crear" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
