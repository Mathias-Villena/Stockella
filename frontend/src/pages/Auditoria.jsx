import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../ui/DashboardLayout";
import { Search, FileText, Activity } from "lucide-react";
import { formatPeru } from "../utils/dateUtils";

const Auditoria = () => {
  const [registros, setRegistros] = useState([]);
  const [resumen, setResumen] = useState({
    total: 0,
    creaciones: 0,
    actualizaciones: 0,
    configuraciones: 0,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [search, setSearch] = useState("");

  // ==== Fetch resumen ====
  const obtenerResumen = async () => {
    const res = await api.get("/auditoria/resumen");
    setResumen(res.data);
  };

  // ==== Fetch auditoría ====
  const obtenerRegistros = async () => {
    const res = await api.get("/auditoria", {
      params: {
        usuario: filtroUsuario || undefined,
        accion: filtroAccion || undefined,
        search: search || undefined,
      },
    });
    console.log("AUDITORIA:", res.data);
    setRegistros(res.data.data || []);

  };

  // ==== Obtener usuarios ====
const obtenerUsuarios = async () => {
  const res = await api.get("/usuarios");
  console.log("RESPUESTA COMPLETA:", res);  // <-- AGREGA ESTO
  console.log("DATA:", res.data);           // <-- Y ESTO
  setUsuarios(res.data.data || []);

};


  useEffect(() => {
  console.log("USEEFFECT EJECUTADO");  // <-- AGREGAR
  obtenerResumen();
  obtenerRegistros();
  obtenerUsuarios();
}, []);
 // primera carga

  useEffect(() => {
    obtenerRegistros();
  }, [filtroUsuario, filtroAccion, search]); // filtros

  // COLOR DEL TAG
  const getTagColor = (accion) => {
    if (accion === "CREAR") return "bg-green-100 text-green-700 border-green-200";
    if (accion === "ACTUALIZAR") return "bg-blue-100 text-blue-700 border-blue-200";
    if (accion === "CONFIGURACION") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Auditoría</h1>
          <p className="text-sm text-slate-500 mt-1">Registro completo e inmutable de acciones en el sistema</p>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Registros</p>
            <h2 className="text-2xl font-extrabold text-slate-800 mt-1">{resumen.total}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1B59F8] flex items-center justify-center border border-blue-100">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Creaciones</p>
            <h2 className="text-2xl font-extrabold text-emerald-600 mt-1">{resumen.creaciones}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Actualizaciones</p>
            <h2 className="text-2xl font-extrabold text-blue-600 mt-1">{resumen.actualizaciones}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Configuraciones</p>
            <h2 className="text-2xl font-extrabold text-purple-600 mt-1">{resumen.configuraciones}</h2>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Activity size={18} />
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en registros..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-700 placeholder-slate-400"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
        >
          <option value="">Todos los usuarios</option>
          {Array.isArray(usuarios) &&
            usuarios.map((u) => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombre}
              </option>
            ))}
        </select>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer"
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
        >
          <option value="">Todas las acciones</option>
          <option value="CREAR">Creaciones</option>
          <option value="ACTUALIZAR">Actualizaciones</option>
          <option value="CONFIGURACION">Configuraciones</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Usuario</th>
                <th className="text-left px-6 py-4">Acción</th>
                <th className="text-left px-6 py-4">Detalle</th>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-center px-6 py-4 w-32">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Array.isArray(registros) && registros.length > 0 ? (
                registros.map((r) => (
                  <tr key={r.id_auditoria} className="hover:bg-blue-50/15 transition duration-150">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {r.Usuario?.nombre || "Sin nombre"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {r.accion}
                    </td>
                    <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-xl truncate">
                      {r.detalle}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatPeru(r.fecha)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide whitespace-nowrap ${getTagColor(r.accion)}`}>
                          {r.accion}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay registros de auditoría disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
