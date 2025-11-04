import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

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

  // Cargar datos si es edición
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

  // Manejar cambios en los inputs
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar producto (crear o editar)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.codigo || !form.precio) {
      Swal.fire("Campos incompletos", "Llena al menos código, nombre y precio.", "warning");
      return;
    }

    setLoading(true);
    try {
      let productoId = producto?.id_producto;

      if (producto) {
        // 🔹 Editar producto
        await api.put(`/productos/${producto.id_producto}`, form);
        Swal.fire("✅ Producto actualizado", "Los cambios se guardaron correctamente.", "success");
      } else {
        // 🔹 Crear producto
        const { data: p } = await api.post("/productos", form);
        productoId = p.id_producto;
        Swal.fire("✅ Producto registrado", "El producto fue creado exitosamente.", "success");
      }

      // 🔹 Subir imagen (nuevo o reemplazo)
      if (file && productoId) {
        const fd = new FormData();
        fd.append("id_producto", productoId);
        fd.append("comoDataset", "true");
        fd.append("file", file);

        await api.post("/upload/producto", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("📸 Imagen subida", "La imagen del producto fue guardada correctamente.", "success");
      }

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "No se pudo guardar el producto.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl p-6 shadow-lg w-[420px] relative"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">
          {producto ? "✎ Editar Producto" : "➕ Nuevo Producto"}
        </h2>

        {/* Código */}
        <input
          name="codigo"
          placeholder="Código"
          value={form.codigo}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
          required
        />

        {/* Nombre */}
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
          required
        />

        {/* Descripción */}
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />

        {/* Precio */}
        <input
          name="precio"
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
          required
        />

        {/* Stock actual */}
        <input
          name="stock_actual"
          type="number"
          placeholder="Stock actual"
          value={form.stock_actual}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />

        {/* Stock mínimo */}
        <input
          name="stock_minimo"
          type="number"
          placeholder="Stock mínimo"
          value={form.stock_minimo}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />

        {/* Unidad */}
        <input
          name="unidad_medida"
          placeholder="Unidad de medida (ej. unidad, kg, litro)"
          value={form.unidad_medida}
          onChange={onChange}
          className="border w-full mb-2 p-2 rounded"
        />

        {/* Imagen actual */}
        {producto?.imagen_principal && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
            <img
              src={producto.imagen_principal}
              alt="Imagen actual"
              className="w-full h-32 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Nueva imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="bg-gray-100 px-3 py-2 rounded-lg mb-3 w-full"
        />

        {/* Botones */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1B59F8] hover:bg-[#174bd3] text-white w-full py-2 rounded mb-2"
        >
          {loading
            ? "Guardando..."
            : producto
            ? "Actualizar Producto"
            : "Crear Producto"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
