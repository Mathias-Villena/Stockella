import { useState } from "react";
import api from "../services/api";

export default function ModalParametro({ modo, data, cerrar, refrescar }) {
  const [clave, setClave] = useState(data?.clave || "");
  const [valor, setValor] = useState(data?.valor || "");
  const [descripcion, setDescripcion] = useState(data?.descripcion || "");

  const guardar = async () => {
    if (modo === "crear") {
      await api.post("/configuracion", { clave, valor, descripcion });
    } else {
      await api.put(`/configuracion/${data.id_config}`, { clave, valor, descripcion });
    }
    refrescar();
    cerrar();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">

        <h2 className="text-xl font-bold mb-4">
          {modo === "crear" ? "Agregar Parámetro" : "Editar Parámetro"}
        </h2>

        <label className="block mb-2">Clave</label>
        <input
          className="w-full border rounded-lg p-2 mb-3"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <label className="block mb-2">Valor</label>
        <input
          className="w-full border rounded-lg p-2 mb-3"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <label className="block mb-2">Descripción</label>
        <textarea
          className="w-full border rounded-lg p-2 mb-3"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button
          onClick={guardar}
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
        >
          {modo === "crear" ? "Agregar Parámetro" : "Actualizar Parámetro"}
        </button>

        <button
          onClick={cerrar}
          className="w-full mt-2 py-2 text-gray-600 hover:underline"
        >
          Cancelar
        </button>

      </div>
    </div>
  );
}
