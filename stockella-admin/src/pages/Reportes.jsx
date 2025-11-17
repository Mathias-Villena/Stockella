import { useEffect, useState } from "react";
import DashboardLayout from "../ui/DashboardLayout";
import api from "../services/api";
import ModalGenerarReporte from "../components/ModalGenerarReporte";
import { Download } from "lucide-react";

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

      <div className="p-6">

        {/* TÍTULO */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reportes</h1>
            <p className="text-gray-500">Genera y descarga reportes del sistema</p>
          </div>

          <button
            onClick={() => setModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
          >
            + Generar Reporte
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div className="bg-white shadow border p-5 rounded-xl">
            <p className="text-gray-500">Total Reportes</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white shadow border p-5 rounded-xl">
            <p className="text-gray-500">Último Creado</p>
            <p className="font-semibold">
              {stats.ultimo ? stats.ultimo.tipo : "—"}
            </p>
            <p className="text-sm text-gray-400">
              {stats.ultimo ? new Date(stats.ultimo.fecha_generacion).toLocaleString() : ""}
            </p>
          </div>

          <div className="bg-white shadow border p-5 rounded-xl">
            <p className="text-gray-500">Este Mes</p>
            <p className="text-3xl font-bold text-blue-600">{stats.esteMes}</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <select
            className="border px-4 py-2 rounded-lg"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="Inventario General">Inventario General</option>
            <option value="Movimientos">Movimientos</option>
            <option value="Stock Bajo">Stock Bajo</option>
          </select>

          <select
            className="border px-4 py-2 rounded-lg"
            value={filtroFormato}
            onChange={(e) => setFiltroFormato(e.target.value)}
          >
            <option value="">Todos los formatos</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
          </select>

          <input
            type="date"
            className="border px-4 py-2 rounded-lg"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Tipo</th>
                <th className="p-4">Formato</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Archivo</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id_reporte} className="border-t">
                  <td className="p-4">{r.tipo}</td>
                  <td className="p-4">
                    {r.formato === "PDF" ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        PDF
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Excel
                      </span>
                    )}
                  </td>
                  <td className="p-4">{r.Usuario?.nombre}</td>
                  <td className="p-4">{new Date(r.fecha_generacion).toLocaleString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => descargar(r.id_reporte)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Download size={18} /> Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && <ModalGenerarReporte close={() => setModal(false)} refresh={obtenerReportes} />}
      </div>

  );
}
