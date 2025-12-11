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
<dialog
  id="dlgMovimiento"
  className="rounded-3xl p-0 backdrop:bg-black/40"
  style={{
    padding: 0,
    border: "none",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    margin: 0,
    zIndex: 9999,
  }}
>
  <form
    onSubmit={handleSubmit(registrarMovimiento)}
    className="bg-white rounded-3xl w-[520px] shadow-2xl p-7 animate-fadeIn"
  >
    {/* HEADER */}
    <div className="flex items-center justify-between mb-6 border-b pb-3">
      <h3 className="text-2xl font-semibold flex items-center gap-2">
        <span className="text-blue-600 text-xl">📦</span>
        Registrar Movimiento
      </h3>

      <button
        type="button"
        onClick={() => document.getElementById("dlgMovimiento").close()}
        className="text-gray-500 hover:text-gray-700 text-xl"
      >
        ✕
      </button>
    </div>

    {/* FORMULARIO */}
    <div className="grid grid-cols-2 gap-4">

      {/* Tipo */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Tipo</label>
        <select
          className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("tipo", { required: true })}
        >
          <option value="">Selecciona tipo</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
        </select>
      </div>

      {/* Producto */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Producto</label>
        <select
          className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("id_producto", { required: true })}
        >
          <option value="">Selecciona producto</option>
          {productos.map((p) => (
            <option key={p.id_producto} value={p.id_producto}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Cantidad */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Cantidad</label>
        <input
          type="number"
          min="1"
          className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ej: 10"
          {...register("cantidad", { required: true })}
        />
      </div>

      {/* Motivo */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Motivo</label>
        <input
          className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Opcional"
          {...register("motivo")}
        />
      </div>

    </div>

    {/* FOOTER */}
    <div className="flex justify-end gap-3 mt-8">
      <button
        type="button"
        onClick={() => document.getElementById("dlgMovimiento").close()}
        className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
      >
        Cancelar
      </button>

      <button
        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
      >
        Guardar
      </button>
    </div>
  </form>
</dialog>


    </div>
  );
}
