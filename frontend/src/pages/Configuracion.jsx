import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../ui/DashboardLayout";
import ModalParametro from "../components/ModalParametro";

export default function Configuracion() {
  const [parametros, setParametros] = useState([]);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ open: false, modo: "crear", data: null });

  const cargar = async () => {
    const res = await api.get("/configuracion");
    setParametros(res.data.data);
    setTotal(res.data.total);
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar parámetro?")) return;
    await api.delete(`/configuracion/${id}`);
    cargar();
  };

  return (
      <div className="px-6 py-4">

        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-gray-500 mb-6">Parámetros globales del sistema</p>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Total Parámetros</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Versión del Sistema</p>
            <p className="text-xl text-blue-600 font-semibold">Stockella v1.0.3</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Modelo IA</p>
            <p className="text-xl text-purple-600 font-semibold">v2.1 Activo</p>
          </div>
        </div>

        {/* Botón Nuevo Parametro */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setModal({ open: true, modo: "crear", data: null })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Nuevo Parámetro
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Clave</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {parametros.map((p) => (
                <tr key={p.id_config} className="border-t">
                  <td className="p-4">{p.clave}</td>
                  <td className="p-4">{p.valor}</td>
                  <td className="p-4 text-gray-600">{p.descripcion}</td>

                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() =>
                        setModal({ open: true, modo: "editar", data: p })
                      }
                      className="text-blue-600 hover:underline"
                    >
                      ✏ Editar
                    </button>

                    <button
                      onClick={() => eliminar(p.id_config)}
                      className="text-red-600 hover:underline"
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {modal.open && (
          <ModalParametro
            modo={modal.modo}
            data={modal.data}
            cerrar={() => setModal({ open: false })}
            refrescar={cargar}
          />
        )}
      </div>
  );
}
