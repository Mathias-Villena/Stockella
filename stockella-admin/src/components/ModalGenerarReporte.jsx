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
        periodo
      });

      Swal.fire("Éxito", "Reporte generado correctamente", "success");
      refresh();
      close();
    } catch  {
      Swal.fire("Error", "No se pudo generar el reporte", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-content-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[450px]">

        <h2 className="text-xl font-bold mb-4">Generar Nuevo Reporte</h2>

        <label className="text-sm font-medium">Tipo de Reporte</label>
        <select
          className="border px-4 py-2 rounded-lg w-full mb-4"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option>Inventario General</option>
          <option>Stock Bajo</option>
          <option>Movimientos</option>
          <option>Auditoría</option>
          <option>Valoración</option>
          <option>Por Categorías</option>
        </select>

        <label className="text-sm font-medium">Formato</label>
        <select
          className="border px-4 py-2 rounded-lg w-full mb-4"
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
        >
          <option>PDF</option>
          <option>Excel</option>
        </select>

        <label className="text-sm font-medium">Periodo</label>
        <select
          className="border px-4 py-2 rounded-lg w-full mb-6"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option>Hoy</option>
          <option>Esta semana</option>
          <option>Este mes</option>
          <option>Este trimestre</option>
          <option>Este año</option>
          <option>Personalizado</option>
        </select>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border" onClick={close}>
            Cancelar
          </button>
          <button
            onClick={generar}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}
