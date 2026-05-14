import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import ModalCategoria from "../components/ModalCategoria";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const cargarCategorias = async () => {
    const { data } = await api.get("/categorias", {
      params: q ? { q } : {},
    });
    setCategorias(data || []);
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const buscar = async (e) => {
    e.preventDefault();
    cargarCategorias();
  };

  const nuevaCategoria = () => {
    setEditing(null);
    setOpen(true);
  };

  const editarCategoria = (cat) => {
    setEditing(cat);
    setOpen(true);
  };

  const eliminarCategoria = async (cat) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: `Se eliminará "${cat.nombre}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/categorias/${cat.id_categoria || cat.id}`);
      Swal.fire("Eliminado", "Categoría eliminada correctamente.", "success");
      cargarCategorias();
    } catch (error) {
      Swal.fire(
        "No se pudo eliminar",
        error.response?.data?.error || "La categoría puede tener productos asociados.",
        "error"
      );
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-800">Categorías</h1>
          <p className="text-gray-500 mt-1">
            Administra las categorías usadas por productos, dashboard y app móvil.
          </p>
        </div>

        <button
          onClick={nuevaCategoria}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <div className="relative w-[420px]">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="premium-input w-full pl-11"
          />
        </div>

        <button className="bg-gray-900 text-white px-6 rounded-2xl font-semibold">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-6 py-4">ID</th>
              <th className="text-left px-6 py-4">Nombre</th>
              <th className="text-left px-6 py-4">Descripción</th>
              <th className="text-center px-6 py-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((cat) => (
              <tr
                key={cat.id_categoria || cat.id}
                className="border-t hover:bg-blue-50/40 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-700">
                  {cat.id_categoria || cat.id}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  {cat.nombre}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {cat.descripcion || "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => editarCategoria(cat)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => eliminarCategoria(cat)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categorias.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalCategoria
        open={open}
        categoria={editing}
        onClose={() => setOpen(false)}
        onSaved={cargarCategorias}
      />
    </div>
  );
}