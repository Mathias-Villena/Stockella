import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

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
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Alertas</h1>
      <p className="text-gray-500 mb-6">Monitoreo y gestión de alertas del sistema</p>

      {/* FILTROS */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Stock Bajo">Stock Bajo</option>
          <option value="Error ML">Error ML</option>
        </select>

        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="false">Pendientes</option>
          <option value="true">Atendidas</option>
        </select>

        <button
          onClick={aplicarFiltros}
          className="bg-[#1B59F8] hover:bg-[#174bd3] text-white rounded-xl"
        >
          Filtrar
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Mensaje</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {alertas.length > 0 ? (
              alertas.map((a) => (
                <tr key={a.id_alerta} className="border-t">
                  <td className="p-3">{new Date(a.fecha).toLocaleString("es-PE")}</td>
                  <td className="p-3">{a.Producto?.nombre}</td>
                  <td className="p-3 font-semibold">{a.tipo}</td>
                  <td className="p-3">{a.mensaje}</td>
                  <td className="p-3">
                    {a.atendida ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">Atendida</span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md">Pendiente</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!a.atendida && (
                      <button
                        onClick={() => marcarAtendida(a.id_alerta)}
                        className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg"
                      >
                        Marcar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No hay alertas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
