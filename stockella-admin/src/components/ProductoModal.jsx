import { useState } from "react";
import api from "../services/api";

export default function ProductoModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock_actual: "",
    stock_minimo: "",
    id_categoria: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // 1️⃣ Crear producto
      const { data: p } = await api.post("/productos", form);

      // 2️⃣ Subir imagen a S3 si hay archivo
      if (file) {
        const fd = new FormData();
        fd.append("id_producto", p.id_producto);
        fd.append("comoDataset", "true");
        fd.append("file", file);

        await api.post("/upload/producto", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("✅ Producto registrado correctamente");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={onCreate}
        className="bg-white rounded-xl p-6 shadow-lg w-[420px]"
      >
        <h2 className="text-lg font-semibold mb-4">Nuevo Producto</h2>

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />
        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />
        <input
          name="precio"
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />
        <input
          name="stock_actual"
          type="number"
          placeholder="Stock actual"
          value={form.stock_actual}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />
        <input
          name="stock_minimo"
          type="number"
          placeholder="Stock mínimo"
          value={form.stock_minimo}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />

        {/* Subida de imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-gray-100 px-3 py-2 rounded-lg mb-3 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Subiendo..." : "Crear producto"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
