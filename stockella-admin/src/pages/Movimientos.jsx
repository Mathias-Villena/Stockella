import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext"; // ✅ para saber el rol del usuario

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [producto, setProducto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const { register, handleSubmit, reset } = useForm();

  const { user } = useAuth(); // ✅ obtenemos el rol del usuario logueado

  // ===============================
  // Cargar datos iniciales
  // ===============================
  useEffect(() => {
    obtenerMovimientos();
    cargarProductos();
  }, []);

  const obtenerMovimientos = async (filtros = {}) => {
    try {
      const { data } = await api.get("/movimientos", { params: filtros });
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    }
  };

  const cargarProductos = async () => {
    try {
      const { data } = await api.get("/productos");
      const lista = Array.isArray(data) ? data : data.data;
      setProductos(lista || []);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
    }
  };

  const aplicarFiltros = () => {
    obtenerMovimientos({ tipo, producto, fechaInicio, fechaFin });
  };

  // ===============================
  // Registrar movimiento
  // ===============================
  const registrarMovimiento = async (form) => {
    try {
      await api.post("/movimientos", form);
      Swal.fire({
        toast: true,
        position: "top-end",
        timer: 1800,
        icon: "success",
        title: "Movimiento registrado",
        showConfirmButton: false,
      });

      // ✅ Actualiza lista sin recargar toda la vista
      obtenerMovimientos();
      // ✅ Refresca también la lista de productos (stock actualizado)
      cargarProductos();

      reset();
      document.getElementById("dlgMovimiento").close();
    } catch (err) {
      Swal.fire(
        "❌ Error",
        err.response?.data?.error || "No se pudo registrar el movimiento",
        "error"
      );
    }
  };

  // ===============================
  // Mostrar botón solo si el rol lo permite
  // ===============================
  const puedeCrear =
    user?.rol === "Administrador" ||
    user?.rol === "Editor" ||
    user?.rol === "Empleado";

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-4">Movimientos</h1>
      <p className="text-gray-500 mb-6">
        Registro y control de entradas y salidas del inventario
      </p>

      {/* FILTROS */}
      <div className="grid md:grid-cols-5 gap-3 mb-4">
        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
        </select>

        <select
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
        >
          <option value="">Todos los productos</option>
          {productos.map((p) => (
            <option key={p.id_producto} value={p.id_producto}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <input
          type="date"
          className="bg-white px-4 py-3 rounded-xl shadow"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <button
          onClick={aplicarFiltros}
          className="bg-[#1B59F8] hover:bg-[#174bd3] text-white rounded-xl"
        >
          Filtrar
        </button>
      </div>

      {/* BOTÓN NUEVO (solo roles permitidos) */}
      {puedeCrear && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => document.getElementById("dlgMovimiento").showModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 py-3"
          >
            + Nuevo Movimiento
          </button>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Motivo</th>
              <th className="p-3">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(movimientos) && movimientos.length > 0 ? (
              movimientos.map((m) => (
                <tr key={m.id_movimiento} className="border-t">
                  <td className="p-3">
                    {new Date(m.fecha).toLocaleString("es-PE")}
                  </td>
                  <td className="p-3">{m.Producto?.nombre || "—"}</td>
                  <td
                    className={`p-3 font-semibold ${
                      m.tipo === "Entrada"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {m.tipo}
                  </td>
                  <td className="p-3">{m.cantidad}</td>
                  <td className="p-3">{m.motivo || "—"}</td>
                  <td className="p-3 text-gray-500">
                    {m.Usuario?.nombre || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No hay movimientos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO MOVIMIENTO */}
      <dialog id="dlgMovimiento" className="rounded-2xl p-0">
        <form
          onSubmit={handleSubmit(registrarMovimiento)}
          className="bg-white rounded-2xl p-6 w-[520px]"
        >
          <h3 className="text-xl font-semibold mb-4">
            Registrar nuevo movimiento
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="bg-gray-100 px-3 py-2 rounded-lg"
              {...register("tipo", { required: true })}
            >
              <option value="">Selecciona tipo</option>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>

            <select
              className="bg-gray-100 px-3 py-2 rounded-lg"
              {...register("id_producto", { required: true })}
            >
              <option value="">Selecciona producto</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="bg-gray-100 px-3 py-2 rounded-lg"
              placeholder="Cantidad"
              {...register("cantidad", { required: true })}
            />
            <input
              className="bg-gray-100 px-3 py-2 rounded-lg"
              placeholder="Motivo (opcional)"
              {...register("motivo")}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() =>
                document.getElementById("dlgMovimiento").close()
              }
              className="px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button className="bg-[#1B59F8] hover:bg-[#174bd3] text-white px-4 py-2 rounded-lg">
              Guardar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
