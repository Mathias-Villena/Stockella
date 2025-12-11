import { useState } from "react";
import api from "../services/api";

export default function DatasetUploadModal({ open, onClose, onUploaded }) {
  const [etiqueta, setEtiqueta] = useState("");
  const [fuente, setFuente] = useState("Admin");
  const [file, setFile] = useState(null);

  if (!open) return null;

  const subir = async () => {
    if (!file || !etiqueta.trim()) {
      alert("Completa todos los campos");
      return;
    }

    const form = new FormData();
    form.append("id_producto", etiqueta);
    form.append("comoDataset", "true");
    form.append("file", file);

    await api.post("/upload/producto", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Agregar Imagen al Dataset</h2>

        {/* Etiqueta */}
        <label className="block text-sm mb-1 font-semibold">Etiqueta / Categoría</label>
        <input
          className="w-full px-3 py-2 border rounded-xl mb-4"
          placeholder="Ej: Coca Cola, Leche Gloria…"
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        />

        {/* Fuente */}
        <label className="block text-sm mb-1 font-semibold">Fuente</label>
        <select
          className="w-full px-3 py-2 border rounded-xl mb-4"
          value={fuente}
          onChange={(e) => setFuente(e.target.value)}
        >
          <option>Admin</option>
          <option>Cámara móvil</option>
          <option>Importación web</option>
          <option>Scanner código</option>
        </select>

        {/* Archivo */}
        <label className="block text-sm mb-1 font-semibold">Imagen</label>
        <div className="border border-dashed rounded-xl p-5 text-center mb-5">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>
          <button
            onClick={subir}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
          >
            Subir Imagen
          </button>
        </div>
      </div>
    </div>
  );
}
