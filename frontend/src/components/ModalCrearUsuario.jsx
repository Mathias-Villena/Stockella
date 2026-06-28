import { useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { playClick, playSuccess } from "../utils/sound";

export default function ModalCrearUsuario({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    id_rol: "",
  });
  const [loading, setLoading] = useState(false);

  const crear = async (e) => {
    if (e) e.preventDefault();

    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim() || !form.id_rol) {
      Swal.fire("Campos incompletos", "Por favor completa todos los campos del usuario.", "warning");
      return;
    }

    setLoading(true);
    try {
      await api.post("/usuarios", {
        ...form,
        id_rol: Number(form.id_rol),
        estado: true,
      });

      playSuccess();
      Swal.fire("Registrado", "Usuario creado correctamente.", "success");
      onCreated();
      onClose();
    } catch (e) {
      console.error("❌ Error creando usuario:", e);
      Swal.fire(
        "Error",
        e.response?.data?.error || "No se pudo crear el usuario.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <form
        onSubmit={crear}
        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xl w-[420px] animate-modalUp flex flex-col gap-4"
      >
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Nuevo Usuario</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nombre</label>
            <input
              placeholder="Nombre completo"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 font-semibold"
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Correo electrónico</label>
            <input
              placeholder="correo@stockella.com"
              type="email"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contraseña</label>
            <input
              placeholder="••••••••"
              type="password"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Rol asignado</label>
            <select
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-600 cursor-pointer"
              onChange={(e) =>
                setForm({ ...form, id_rol: e.target.value })
              }
              value={form.id_rol}
            >
              <option value="">Selecciona un rol</option>
              <option value="1">Administrador</option>
              <option value="2">Editor</option>
              <option value="3">Visualizador</option>
              <option value="4">Empleado</option>
            </select>
          </div>
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
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer transition text-center disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}