import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../ui/DashboardLayout";

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
    if (accion === "CREAR") return "bg-green-100 text-green-700";
    if (accion === "ACTUALIZAR") return "bg-blue-100 text-blue-700";
    if (accion === "CONFIGURACION") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
  };

  return (

      <div className="px-6 py-4">

        {/* ==== TÍTULO ==== */}
        <h1 className="text-3xl font-bold mb-2">Auditoría</h1>
        <p className="text-gray-500 mb-6">Registro completo de acciones en el sistema</p>

        {/* ==== CARDS DE MÉTRICAS ==== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Total Registros</p>
            <p className="text-2xl font-bold">{resumen.total}</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Creaciones</p>
            <p className="text-2xl font-bold text-green-600">{resumen.creaciones}</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Actualizaciones</p>
            <p className="text-2xl font-bold text-blue-600">{resumen.actualizaciones}</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Configuraciones</p>
            <p className="text-2xl font-bold text-purple-600">{resumen.configuraciones}</p>
          </div>

        </div>

        {/* ==== FILTROS ==== */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">

          <input
            type="text"
            placeholder="Buscar en registros..."
            className="border rounded-lg px-4 py-2 flex-1"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2"
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
            className="border rounded-lg px-4 py-2"
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
          >
            <option value="">Todas las acciones</option>
            <option value="CREAR">Creaciones</option>
            <option value="ACTUALIZAR">Actualizaciones</option>
            <option value="CONFIGURACION">Configuraciones</option>
          </select>

        </div>

        {/* ==== TABLA ==== */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Detalle</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
              </tr>
            </thead>
            <tbody>

              {Array.isArray(registros) &&
  registros.map((r) => (
    <tr key={r.id_auditoria} className="border-t">
      <td className="p-4">{r.Usuario?.nombre || "Sin nombre"}</td>
      <td className="p-4">{r.accion}</td>
      <td className="p-4 text-gray-600">{r.detalle}</td>
      <td className="p-4">{new Date(r.fecha).toLocaleString()}</td>
      <td className="p-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(r.accion)}`}>
          {r.accion}
        </span>
      </td>
    </tr>
  ))}


            </tbody>
          </table>
        </div>

      </div>

  );
};

export default Auditoria;
