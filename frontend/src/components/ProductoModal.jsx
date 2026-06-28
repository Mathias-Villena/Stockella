import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { playClick, playSuccess } from "../utils/sound";
import {
  Tag,
  Package,
  DollarSign,
  Layers,
  Ruler,
  Image as ImgIcon,
} from "lucide-react";

export default function ProductoModal({
  onClose,
  onCreated,
  producto,
  categorias = [],
}) {
  const isEdit = !!producto;

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock_actual: "",
    stock_minimo: "",
    id_categoria: "",
    unidad_medida: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || "",
        stock_actual: producto.stock_actual || "",
        stock_minimo: producto.stock_minimo || "",
        id_categoria: producto.id_categoria || "",
        unidad_medida: producto.unidad_medida || "",
      });
    } else {
      setForm({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock_actual: "",
        stock_minimo: "",
        id_categoria: "",
        unidad_medida: "",
      });
    }
  }, [producto]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.precio || !form.id_categoria) {
      Swal.fire(
        "Campos incompletos",
        "Nombre, precio y categoría son obligatorios.",
        "warning"
      );
      return;
    }

    if (!isEdit && !form.codigo) {
      Swal.fire(
        "Campos incompletos",
        "El código es obligatorio al registrar un producto.",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      let productoId = producto?.id_producto;

      if (isEdit) {
        const payload = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: form.precio,
          stock_minimo: form.stock_minimo,
          id_categoria: form.id_categoria,
          unidad_medida: form.unidad_medida,
        };

        await api.put(`/productos/${producto.id_producto}`, payload);
        playSuccess();
        Swal.fire("Producto actualizado", "Los cambios fueron guardados.", "success");
      } else {
        const payload = {
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: form.precio,
          stock_actual: form.stock_actual,
          stock_minimo: form.stock_minimo,
          id_categoria: form.id_categoria,
          unidad_medida: form.unidad_medida,
        };

        const { data: p } = await api.post("/productos", payload);
        productoId = p.id_producto || p.idProducto || p.id;
        playSuccess();
        Swal.fire("Producto creado", "Se registró correctamente.", "success");
      }

      if (file && productoId) {
        const fd = new FormData();
        fd.append("id_producto", productoId);
        fd.append("comoDataset", "true");
        fd.append("file", file);

        await api.post("/upload/producto", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el producto.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={onSubmit}
        className="
          bg-white rounded-3xl shadow-2xl w-[560px] border border-slate-100
          p-8 animate-modalUp max-h-[90vh] overflow-y-auto custom-scroll flex flex-col gap-5
        "
      >
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isEdit ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Por favor ingresa los detalles del producto para mantener actualizado tu inventario.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Código solo al crear */}
          {!isEdit && (
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Tag size={14} className="text-slate-400" /> Código
              </label>
              <input
                name="codigo"
                value={form.codigo}
                onChange={onChange}
                className="premium-input font-semibold"
                required
              />
            </div>
          )}

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Package size={14} className="text-slate-400" /> Nombre
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="premium-input font-semibold"
              required
            />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <DollarSign size={14} className="text-slate-400" /> Precio
            </label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={onChange}
              className="premium-input font-semibold"
              required
            />
          </div>

          {/* Unidad */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Ruler size={14} className="text-slate-400" /> Unidad
            </label>
            <input
              name="unidad_medida"
              value={form.unidad_medida}
              placeholder="unidad / kg / litro"
              onChange={onChange}
              className="premium-input font-semibold"
            />
          </div>

          {/* Stock actual solo al crear */}
          {!isEdit && (
            <div className="flex flex-col gap-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stock Actual</label>
              <input
                type="number"
                name="stock_actual"
                value={form.stock_actual}
                onChange={onChange}
                className="premium-input font-semibold"
              />
            </div>
          )}

          {/* Stock mínimo */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stock Mínimo</label>
            <input
              type="number"
              name="stock_minimo"
              value={form.stock_minimo}
              onChange={onChange}
              className="premium-input font-semibold"
            />
          </div>

          {/* Categoría */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Layers size={14} className="text-slate-400" /> Categoría
            </label>
            <select
              name="id_categoria"
              value={form.id_categoria}
              onChange={onChange}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 cursor-pointer font-semibold"
              required
            >
              <option value="">Selecciona categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700 placeholder-slate-400 h-24 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Imagen actual */}
        {producto?.imagen_principal && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <ImgIcon size={14} className="text-slate-400" /> Imagen Actual
            </label>
            <img
              src={producto.imagen_principal}
              alt={producto.nombre}
              className="w-full h-40 object-cover rounded-2xl border border-slate-100 shadow-sm"
            />
          </div>
        )}

        {/* Nueva imagen */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <ImgIcon size={14} className="text-slate-400" /> {producto?.imagen_principal ? "Cambiar Imagen" : "Imagen del Producto"}
          </label>
          <div className="border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition rounded-xl p-4 text-center cursor-pointer relative overflow-hidden flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <span className="text-xs font-semibold text-slate-500">
              {file ? `✓ ${file.name}` : "Haga clic o arrastre una imagen aquí"}
            </span>
          </div>
        </div>

        {/* Botones */}
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer transition disabled:opacity-50 text-center"
          >
            {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}