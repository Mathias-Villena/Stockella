import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";

export default function ModalCategoria({ open, onClose, onSaved, categoria }) {
  const isEdit = !!categoria;

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoria) {
      setForm({
        nombre: categoria.nombre || "",
        descripcion: categoria.descripcion || "",
      });
    } else {
      setForm({ nombre: "", descripcion: "" });
    }
  }, [categoria]);

  if (!open) return null;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      Swal.fire("Campo requerido", "El nombre es obligatorio.", "warning");
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/categorias/${categoria.id_categoria || categoria.id}`, form);
        Swal.fire("Actualizado", "Categoría actualizada correctamente.", "success");
      } else {
        await api.post("/categorias", form);
        Swal.fire("Registrado", "Categoría creada correctamente.", "success");
      }

      onSaved();
      onClose();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.error || "No se pudo guardar la categoría.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={guardar}
        className="bg-white w-[480px] rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEdit ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <label className="text-sm font-semibold text-gray-600">Nombre</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={onChange}
          className="premium-input w-full mt-1 mb-4"
          placeholder="Ej: Bebidas"
        />

        <label className="text-sm font-semibold text-gray-600">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={onChange}
          className="premium-input w-full mt-1 h-28 resize-none"
          placeholder="Ej: Productos líquidos y refrescos"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold mt-6"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Categoría"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-2xl mt-3"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}