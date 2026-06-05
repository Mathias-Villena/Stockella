import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [producto, setProducto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm();

  const { user } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productoNombre, setProductoNombre] = useState("");
  const dropdownRef = useRef(null);

  // ===============================
  // Cargar datos iniciales
  // ===============================
  useEffect(() => {
    obtenerMovimientos();
    cargarProductos();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
      const { data } = await api.get("/productos", {
        params: { page: 1, limit: 500 },
      });
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
      obtenerMovimientos();
      cargarProductos();
      reset();
      setProductoNombre("");
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
                      m.tipo === "Entrada" ? "text-emerald-600" : "text-red-500"
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
          overflow: "visible",
        }}
      >
        <form
          onSubmit={handleSubmit(registrarMovimiento)}
          className="bg-white rounded-3xl w-[520px] shadow-2xl p-7 animate-fadeIn"
          style={{ overflow: "visible" }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <span className="text-blue-600 text-xl">📦</span>
              Registrar Movimiento
            </h3>
            <button
              type="button"
              onClick={() => {
                document.getElementById("dlgMovimiento").close();
                setDropdownOpen(false);
              }}
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

            {/* Producto — dropdown custom */}
            <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
              <label className="text-sm font-medium text-gray-600">Producto</label>

              {/* Campo oculto registrado por react-hook-form */}
              <input
                type="hidden"
                {...register("id_producto", { required: true })}
              />

              {/* Botón trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left flex items-center justify-between w-full"
              >
                <span
                  className={`text-sm truncate ${
                    productoNombre ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {productoNombre || "Selecciona producto"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Lista desplegable */}
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
                  style={{ maxHeight: "200px", zIndex: 99999 }}
                >
                  {/* Opción vacía */}
                  <button
                    type="button"
                    onClick={() => {
                      setValue("id_producto", "");
                      setProductoNombre("");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-100"
                  >
                    Selecciona producto
                  </button>

                  {productos.map((p) => (
                    <button
                      key={p.id_producto}
                      type="button"
                      onClick={() => {
                        setValue("id_producto", p.id_producto);
                        setProductoNombre(p.nombre);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {p.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Cantidad</label>
              <input
                type="number"
                min="1"
                className="bg-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full"
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
              onClick={() => {
                document.getElementById("dlgMovimiento").close();
                setDropdownOpen(false);
              }}
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