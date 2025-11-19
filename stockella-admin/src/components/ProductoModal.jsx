import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { Tag, Package, DollarSign, Layers, Ruler, Image as ImgIcon } from "lucide-react";

export default function ProductoModal({ onClose, onCreated, producto }) {
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
    }
  }, [producto]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.codigo || !form.precio) {
      Swal.fire("Campos incompletos", "Código, nombre y precio son obligatorios.", "warning");
      return;
    }

    setLoading(true);
    try {
      let productoId = producto?.id_producto;

      if (producto) {
        await api.put(`/productos/${producto.id_producto}`, form);
        Swal.fire("Producto actualizado", "Los cambios fueron guardados.", "success");
      } else {
        const { data: p } = await api.post("/productos", form);
        productoId = p.id_producto;
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
  onSubmit={onSubmit}
  className="
    bg-white rounded-3xl shadow-2xl w-[560px] border border-gray-100 
    p-8 animate-fadeIn
    max-h-[90vh]
    overflow-y-auto
    custom-scroll
  "
>

        <h2 className="text-3xl font-bold text-center mb-8 tracking-tight text-gray-800">
          {producto ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        {/* FORM GRID */}
        <div className="grid grid-cols-2 gap-6">

          {/* Código */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Tag size={16} /> Código
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={onChange}
              className="premium-input"
              required
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Package size={16} /> Nombre
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="premium-input"
              required
            />
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <DollarSign size={16} /> Precio
            </label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={onChange}
              className="premium-input"
              required
            />
          </div>

          {/* Unidad */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Ruler size={16} /> Unidad
            </label>
            <input
              name="unidad_medida"
              value={form.unidad_medida}
              placeholder="unidad / kg / litro"
              onChange={onChange}
              className="premium-input"
            />
          </div>

          {/* Stock actual */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Stock Actual</label>
            <input
              type="number"
              name="stock_actual"
              value={form.stock_actual}
              onChange={onChange}
              className="premium-input"
            />
          </div>

          {/* Stock mínimo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Stock Mínimo</label>
            <input
              type="number"
              name="stock_minimo"
              value={form.stock_minimo}
              onChange={onChange}
              className="premium-input"
            />
          </div>

          {/* Categoría */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Layers size={16} /> Categoría
            </label>
            <select
              name="id_categoria"
              value={form.id_categoria}
              onChange={onChange}
              className="premium-input"
              required
            >
              <option value="">Selecciona categoría</option>
              <option value="1">Gaseosas</option>
              <option value="2">Galletas</option>
              <option value="3">Snacks</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              className="premium-input h-28 resize-none"
            />
          </div>
        </div>

        {/* Imagen */}
        {producto?.imagen_principal && (
          <div className="mt-6">
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <ImgIcon size={16} /> Imagen Actual
            </label>
            <img
              src={producto.imagen_principal}
              className="w-full h-40 object-cover rounded-xl border shadow-sm"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-gray-100 px-3 py-2 rounded-xl mb-6 w-full mt-4 text-sm"
        />

        {/* Botones */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition"
        >
          {loading ? "Guardando..." : producto ? "Guardar Cambios" : "Registrar Producto"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 mt-3 rounded-2xl bg-gray-200 hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
