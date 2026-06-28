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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Categorías</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra las categorías usadas por productos, dashboard y app móvil
          </p>
        </div>

        <button
          onClick={nuevaCategoria}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      {/* BUSCADOR */}
      <form onSubmit={buscar} className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-[420px]">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-700 placeholder-slate-400"
          />
        </div>

        <button className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer w-full sm:w-auto">
          Buscar
        </button>
      </form>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4 w-20">ID</th>
                <th className="text-left px-6 py-4">Nombre</th>
                <th className="text-left px-6 py-4">Descripción</th>
                <th className="text-center px-6 py-4 w-32">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categorias.map((cat) => (
                <tr
                  key={cat.id_categoria || cat.id}
                  className="hover:bg-blue-50/15 transition duration-150"
                >
                  <td className="px-6 py-4 font-semibold text-slate-500">
                    #{cat.id_categoria || cat.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {cat.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-md truncate">
                    {cat.descripcion || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => editarCategoria(cat)}
                        className="h-8 w-8 rounded-lg bg-blue-50 text-[#1B59F8] hover:bg-blue-100 flex items-center justify-center transition cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => eliminarCategoria(cat)}
                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categorias.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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