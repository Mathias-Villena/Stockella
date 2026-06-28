import { useEffect, useState } from "react";
import api from "../services/api";
import ModalCrearUsuario from "../components/ModalCrearUsuario";
import ProfileModal from "../components/ProfileModal";
import { Search, Plus, Eye, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openCrear, setOpenCrear] = useState(false);
  const [userSelected, setUserSelected] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/usuarios", {
        params: {
          q,
          page,
          limit: 10,
        },
      });

      setUsuarios(data.data || []);
      setPaginas(data.paginas || 1);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [page]);

  const buscar = () => {
    setPage(1);
    cargarUsuarios();
  };

  const eliminarUsuario = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción eliminará el usuario del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/usuarios/${id}`);
      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
      cargarUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de usuarios, accesos y roles del sistema</p>
        </div>

        <button
          onClick={() => setOpenCrear(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-[420px]">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-700 placeholder-slate-400"
          />
        </div>

        <button
          onClick={buscar}
          className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer w-full sm:w-auto text-center"
        >
          Buscar
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Nombre</th>
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4 w-40">Rol</th>
                <th className="text-left px-6 py-4 w-32">Estado</th>
                <th className="text-center px-6 py-4 w-32">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-blue-50/15 transition duration-150">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {u.nombre}
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.email}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        {u.Rol?.nombre || "Sin rol"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.estado ? (
                        <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setUserSelected({
                              nombre: u.nombre,
                              email: u.email,
                              rol: u.Rol?.nombre,
                            })
                          }
                          className="h-8 w-8 rounded-lg bg-blue-50 text-[#1B59F8] hover:bg-blue-100 flex items-center justify-center transition cursor-pointer"
                          title="Ver perfil"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => eliminarUsuario(u.id_usuario)}
                          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer"
        >
          « Anterior
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Página {page} de {paginas}
        </span>

        <button
          disabled={page >= paginas}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold shadow-sm transition cursor-pointer"
        >
          Siguiente »
        </button>
      </div>

      {/* Modal crear usuario */}
      {openCrear && (
        <ModalCrearUsuario
          onClose={() => setOpenCrear(false)}
          onCreated={() => {
            setOpenCrear(false);
            cargarUsuarios();
          }}
        />
      )}

      {/* Modal perfil */}
      <ProfileModal
        open={!!userSelected}
        onClose={() => setUserSelected(null)}
        user={userSelected}
      />
    </div>
  );
}