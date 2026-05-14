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
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Gestión de usuarios y roles del sistema
          </p>
        </div>

        <button
          onClick={() => setOpenCrear(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="flex gap-3 mb-6">
        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar por nombre o correo..."
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={buscar}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl"
        >
          Buscar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rol</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-center p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-800">
                    {u.nombre}
                  </td>

                  <td className="p-4 text-gray-600">{u.email}</td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {u.Rol?.nombre || "Sin rol"}
                    </span>
                  </td>

                  <td className="p-4">
                    {u.estado ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        Activo
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          setUserSelected({
                            nombre: u.nombre,
                            email: u.email,
                            rol: u.Rol?.nombre,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver perfil"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => eliminarUsuario(u.id_usuario)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-gray-600">
          Página {page} de {paginas}
        </span>

        <button
          disabled={page >= paginas}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
        >
          Siguiente
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