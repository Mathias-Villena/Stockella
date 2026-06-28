import { useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

export default function ModalGenerarReporte({ close, refresh }) {
  const [tipo, setTipo] = useState("Inventario General");
  const [formato, setFormato] = useState("PDF");
  const [periodo, setPeriodo] = useState("Este mes");

  const generar = async () => {
    try {
      await api.post("/reportes/generar", {
        tipo,
        formato,
        periodo,
      });

      Swal.fire("Éxito", "Reporte generado correctamente", "success");
      refresh();
      close();
    } catch (error) {
      console.error("❌ Error generando reporte:", error?.response?.data || error);
      Swal.fire(
        "Error",
        error?.response?.data?.error || "No se pudo generar el reporte",
        "error"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-[450px] animate-modalUp flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Generar Reporte</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Reporte</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-600 cursor-pointer"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option>Inventario General</option>
              <option>Stock Bajo</option>
              <option>Movimientos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Formato</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-600 cursor-pointer"
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
            >
              <option>PDF</option>
              <option>Excel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Periodo</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-600 cursor-pointer"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option>Hoy</option>
              <option>Esta semana</option>
              <option>Este mes</option>
              <option>Este trimestre</option>
              <option>Este año</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-2 pt-4 border-t border-slate-50">
          <button
            onClick={close}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition text-center"
          >
            Cancelar
          </button>
          <button
            onClick={generar}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer transition text-center animate-pulse-once"
          >
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}