import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { playClick, playSuccess } from "../utils/sound";

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
        playSuccess();
        Swal.fire("Actualizado", "Categoría actualizada correctamente.", "success");
      } else {
        await api.post("/categorias", form);
        playSuccess();
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
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={guardar}
        className="bg-white w-[480px] rounded-3xl border border-slate-100 shadow-2xl p-6 animate-modalUp flex flex-col gap-4"
      >
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {isEdit ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 font-semibold"
            placeholder="Ej: Bebidas"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 h-28 resize-none leading-relaxed"
            placeholder="Ej: Productos líquidos y refrescos"
          />
        </div>

        <div className="flex gap-3 mt-2 pt-4 border-t border-slate-50">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition text-center"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer transition disabled:opacity-50 text-center"
          >
            {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}