import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { ArrowUpDown, Filter, Plus, Calendar, Search } from "lucide-react";
import { formatPeru } from "../utils/dateUtils";

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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Movimientos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro y control de entradas y salidas del inventario
          </p>
        </div>

        {puedeCrear && (
          <button
            onClick={() => document.getElementById("dlgMovimiento").showModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/10 cursor-pointer transition text-sm w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            Nuevo Movimiento
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer w-full"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
        </select>

        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600 cursor-pointer w-full"
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

        <div className="relative w-full">
          <Calendar size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="date"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="relative w-full">
          <Calendar size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="date"
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-slate-600"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <button
          onClick={aplicarFiltros}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer w-full"
        >
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-left px-6 py-4">Producto</th>
                <th className="text-left px-6 py-4 w-32">Tipo</th>
                <th className="text-left px-6 py-4 w-32">Cantidad</th>
                <th className="text-left px-6 py-4">Motivo</th>
                <th className="text-left px-6 py-4">Operario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Array.isArray(movimientos) && movimientos.length > 0 ? (
                movimientos.map((m) => (
                  <tr key={m.id_movimiento} className="hover:bg-blue-50/15 transition duration-150">
                    <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                      {formatPeru(m.fecha)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {m.Producto?.nombre || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.tipo === "Entrada" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          ↑ Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          ↓ Salida
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {m.cantidad} uds.
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-sm truncate leading-relaxed">
                      {m.motivo || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {m.Usuario?.nombre || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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