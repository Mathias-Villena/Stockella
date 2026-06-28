import { useEffect, useState } from "react";
import DashboardLayout from "../ui/DashboardLayout";
import api from "../services/api";
import ModalGenerarReporte from "../components/ModalGenerarReporte";
import { Download, FileBarChart2, Filter, Plus, Calendar } from "lucide-react";
import { formatPeru } from "../utils/dateUtils";

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroFormato, setFiltroFormato] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [modal, setModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ultimo: null,
    esteMes: 0,
  });

  const obtenerReportes = async () => {
    const res = await api.get("/reportes", {
      params: {
        tipo: filtroTipo || undefined,
        formato: filtroFormato || undefined,
        fecha: filtroFecha || undefined
      }
    });
    setReportes(res.data);

    // === Stats ===
    setStats({
      total: res.data.length,
      ultimo: res.data[0] || null,
      esteMes: res.data.filter(r =>
        new Date(r.fecha_generacion).getMonth() === new Date().getMonth()
      ).length
    });
  };

  const descargar = async (id) => {
    const res = await api.get(`/reportes/${id}/descargar`, {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${id}`;
    a.click();
  };

  useEffect(() => {
    obtenerReportes();
  }, []);

  useEffect(() => {
    obtenerReportes();
  }, [filtroTipo, filtroFormato, filtroFecha]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Genera y descarga reportes de inventario y movimientos</p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Generar Reporte
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Reportes</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.total}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1B59F8] flex items-center justify-center border border-blue-100">
            <FileBarChart2 size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-500">Último Creado</p>
            <h4 className="font-bold text-slate-800 truncate mt-1">
              {stats.ultimo ? stats.ultimo.tipo : "—"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {stats.ultimo ? formatPeru(stats.ultimo.fecha_generacion) : "Sin registros"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <FileBarChart2 size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Este Mes</p>
            <h2 className="text-3xl font-extrabold text-blue-600 mt-1">{stats.esteMes}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FileBarChart2 size={18} />
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Inventario General">Inventario General</option>
          <option value="Movimientos">Movimientos</option>
          <option value="Stock Bajo">Stock Bajo</option>
        </select>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={filtroFormato}
          onChange={(e) => setFiltroFormato(e.target.value)}
        >
          <option value="">Todos los formatos</option>
          <option value="PDF">PDF</option>
          <option value="Excel">Excel</option>
        </select>

        <div className="relative w-full">
          <Calendar size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="date"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Tipo</th>
                <th className="text-left px-6 py-4 w-32">Formato</th>
                <th className="text-left px-6 py-4">Generado por</th>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-center px-6 py-4 w-40">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reportes.map((r) => (
                <tr key={r.id_reporte} className="hover:bg-blue-50/15 transition duration-150">
                  <td className="px-6 py-4 font-bold text-slate-800">{r.tipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {r.formato === "PDF" ? (
                      <span className="inline-block text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                        PDF
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                        Excel
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{r.Usuario?.nombre || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {formatPeru(r.fecha_generacion)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => descargar(r.id_reporte)}
                        className="inline-flex items-center justify-center gap-1.5 bg-blue-50 text-[#1B59F8] border border-blue-200/50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Download size={13} />
                        Descargar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reportes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay reportes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ModalGenerarReporte close={() => setModal(false)} refresh={obtenerReportes} />}
    </div>
  );
}
