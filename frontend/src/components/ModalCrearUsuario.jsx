import { useState } from "react";
import api from "../services/api";

export default function ModalCrearUsuario({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    id_rol: "",
  });

  const crear = async () => {
    try {
      await api.post("/usuarios", {
        ...form,
        id_rol: Number(form.id_rol),
        estado: true,
      });

      alert("Usuario creado");
      onCreated();
    } catch (e) {
      console.error(e);
      alert("Error creando usuario");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4">Nuevo Usuario</h2>

        <input
          placeholder="Nombre"
          className="w-full border p-2 mb-2"
          onChange={(e) =>
            setForm({ ...form, nombre: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border p-2 mb-2"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full border p-2 mb-2"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full border p-2 mb-4"
          onChange={(e) =>
            setForm({ ...form, id_rol: e.target.value })
          }
        >
          <option value="1">Administrador</option>
<option value="2">Editor</option>
<option value="3">Visualizador</option>
<option value="4">Empleado</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={crear}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}