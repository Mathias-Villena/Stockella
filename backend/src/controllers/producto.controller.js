const { Producto, Categoria, ImagenProducto, Alerta } = require("../models");
const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");

// =========================
// 📦 LISTAR PRODUCTOS
// =========================
exports.listar = async (req, res) => {
  try {
    const { q, categoria, page = 1, limit = 9 } = req.query;

    const where = {};
    if (q) where.nombre = { [Op.iLike]: `%${q}%` };
    if (categoria) where.id_categoria = Number(categoria);

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 9, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [
        { model: Categoria, as: "Categoria", attributes: ["nombre"], required: false },
        {
          model: ImagenProducto,
          attributes: ["url", "es_principal"],
          where: { es_principal: true },
          required: false,
        },
      ],
      order: [["id_producto", "DESC"]],
      limit: limitNum,
      offset,
    });

    const data = rows.map((p) => ({
      ...p.toJSON(),
      imagen_principal: p.ImagenProductos?.[0]?.url || null,
    }));

    res.json({
      total: count,
      paginas: Math.max(Math.ceil(count / limitNum), 1),
      page: pageNum,
      limit: limitNum,
      data,
    });
  } catch (error) {
    console.error("❌ Error al listar productos:", error);
    res.status(500).json({ error: "Error al listar productos" });
  }
};

// =========================
// 🧽 NORMALIZAR BODY PARA CREAR PRODUCTO
// =========================
function normalizarBodyCrear(body) {
  return {
    codigo: body.codigo ? String(body.codigo).trim() : "",
    nombre: body.nombre ? String(body.nombre).trim() : "",
    descripcion: body.descripcion || "",
    precio: body.precio !== undefined ? Number(body.precio) : 0,
    stock_actual: body.stock_actual !== undefined ? Number(body.stock_actual) : 0,
    stock_minimo: body.stock_minimo !== undefined ? Number(body.stock_minimo) : 0,
    unidad_medida: body.unidad_medida || "unidad",
    id_categoria: body.id_categoria ? Number(body.id_categoria) : null,
  };
}

// =========================
// 🧽 NORMALIZAR BODY PARA ACTUALIZAR PRODUCTO
// Solo actualiza campos enviados
// =========================
function normalizarBodyActualizar(body) {
  const data = {};

  if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
  if (body.descripcion !== undefined) data.descripcion = body.descripcion || "";
  if (body.precio !== undefined) data.precio = Number(body.precio);
  if (body.stock_minimo !== undefined) data.stock_minimo = Number(body.stock_minimo);
  if (body.unidad_medida !== undefined) data.unidad_medida = body.unidad_medida || "unidad";
  if (body.id_categoria !== undefined) {
    data.id_categoria = body.id_categoria ? Number(body.id_categoria) : null;
  }

  // Solo permitir estos si realmente quieres editarlos desde backend
  if (body.codigo !== undefined) data.codigo = String(body.codigo).trim();
  if (body.stock_actual !== undefined) data.stock_actual = Number(body.stock_actual);

  return data;
}

// =========================
// ➕ CREAR PRODUCTO
// =========================
exports.crear = async (req, res) => {
  try {
    const data = normalizarBodyCrear(req.body);

    if (!data.id_categoria) {
      return res.status(400).json({ error: "La categoría es obligatoria" });
    }
    if (!data.codigo || !String(data.codigo).trim()) {
      return res.status(400).json({ error: "El código es obligatorio" });
    }
    if (!data.nombre || !String(data.nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const p = await Producto.create(data);

    await registrarAccion(
      req.user.id_usuario,
      "CREAR",
      `Agregó producto '${p.nombre}' al inventario`
    );

    await evaluarAlerta(p);

    res.status(201).json({ id_producto: p.id_producto });
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
};

// =========================
// ✏️ ACTUALIZAR PRODUCTO
// =========================
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalizarBodyActualizar(req.body);

    // Bloquear cambios de código y stock_actual desde este endpoint si quieres
    delete data.codigo;
    delete data.stock_actual;

    await Producto.update(data, { where: { id_producto: id } });

    const p = await Producto.findByPk(id);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });

    await registrarAccion(
      req.user.id_usuario,
      "ACTUALIZAR",
      `Actualizó producto '${p.nombre}'`
    );

    await evaluarAlerta(p);

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

// =========================
// 🗑️ ELIMINAR PRODUCTO
// =========================
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const p = await Producto.findByPk(id);

    await registrarAccion(
      req.user.id_usuario,
      "CONFIGURACION",
      `Eliminó producto '${p?.nombre || id}'`
    );

    await Producto.destroy({ where: { id_producto: id } });

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
};

// =========================
// 🔎 OBTENER PRODUCTO POR CÓDIGO (BARCODE)
// =========================
exports.obtenerPorCodigo = async (req, res) => {
  try {
    const codigoLimpio = String(req.params.codigo || "").trim();

    if (!codigoLimpio) {
      return res.status(400).json({ error: "Código inválido" });
    }

    const p = await Producto.findOne({
      where: { codigo: codigoLimpio },
      include: [
        { model: Categoria, as: "Categoria", attributes: ["nombre"], required: false },
        {
          model: ImagenProducto,
          attributes: ["url", "es_principal"],
          where: { es_principal: true },
          required: false,
        },
      ],
    });

    if (!p) return res.status(404).json({ error: "Producto no encontrado" });

    const json = p.toJSON();

    return res.json({
      ...json,
      imagen_principal: p.ImagenProductos?.[0]?.url || null,
    });
  } catch (error) {
    console.error("❌ Error obteniendo producto por código:", error);
    return res.status(500).json({ error: "Error al buscar producto por código" });
  }
};

// =========================
// 🔔 EVALUAR ALERTA STOCK BAJO
// =========================
async function evaluarAlerta(prod) {
  try {
    if (!prod) return;

    if (prod.stock_actual <= prod.stock_minimo) {
      await Alerta.create({
        id_producto: prod.id_producto,
        tipo: "Stock Bajo",
        mensaje: `Stock actual ${prod.stock_actual} ≤ mínimo ${prod.stock_minimo}`,
      });
    }
  } catch (e) {
    console.error("❌ Error evaluando alerta:", e);
  }
}