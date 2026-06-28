import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { AlertTriangle, Filter, Check } from "lucide-react";
import { formatPeru } from "../utils/dateUtils";

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");

  useEffect(() => {
    obtenerAlertas();
  }, []);

  const obtenerAlertas = async (filtros = {}) => {
    try {
      const { data } = await api.get("/alertas", { params: filtros });
      setAlertas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const aplicarFiltros = () => {
    obtenerAlertas({ tipo, atendida: estado });
  };

  const marcarAtendida = async (id) => {
    try {
      await api.put(`/alertas/${id}/atender`);
      Swal.fire("Listo", "Alerta marcada como atendida", "success");
      obtenerAlertas();
    } catch  {
      Swal.fire("Error", "No se pudo actualizar la alerta", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Alertas</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoreo y gestión de alertas críticas del sistema</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Stock Bajo">Stock Bajo</option>
          <option value="Error ML">Error ML</option>
        </select>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todas las alertas</option>
          <option value="false">Pendientes</option>
          <option value="true">Atendidas</option>
        </select>

        <button
          onClick={aplicarFiltros}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm w-full"
        >
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-left px-6 py-4">Producto</th>
                <th className="text-left px-6 py-4">Tipo</th>
                <th className="text-left px-6 py-4">Mensaje</th>
                <th className="text-left px-6 py-4 w-32">Estado</th>
                <th className="text-center px-6 py-4 w-32">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alertas.length > 0 ? (
                alertas.map((a) => (
                  <tr key={a.id_alerta} className="hover:bg-blue-50/15 transition duration-150">
                    <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                      {formatPeru(a.fecha)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {a.Producto?.nombre || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{a.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-sm truncate">
                      {a.mensaje}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {a.atendida ? (
                        <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Atendida
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {!a.atendida ? (
                          <button
                            onClick={() => marcarAtendida(a.id_alerta)}
                            className="inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            <Check size={13} />
                            Atender
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay alertas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
