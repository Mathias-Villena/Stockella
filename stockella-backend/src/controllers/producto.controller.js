const { Producto, Categoria, ImagenProducto, Alerta } = require('../models');
const { Op } = require('sequelize');
const registrarAccion = require('../middlewares/auditoria');

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
        { model: Categoria, as: "Categoria", attributes: ['nombre'], required: false },
        {
          model: ImagenProducto,
          attributes: ['url', 'es_principal'],
          where: { es_principal: true },
          required: false
        },
      ],
      order: [['id_producto', 'DESC']],
      limit: limitNum,
      offset
    });

    const data = rows.map(p => ({
      ...p.toJSON(),
      imagen_principal: p.ImagenProductos?.[0]?.url || null,
    }));

    res.json({
      total: count,
      paginas: Math.max(Math.ceil(count / limitNum), 1),
      page: pageNum,
      limit: limitNum,
      data
    });
  } catch (error) {
    console.error('❌ Error al listar productos:', error);
    res.status(500).json({ error: 'Error al listar productos' });
  }
};


/* ============================================================
   ⚠️ ARREGLADO: VALIDACIÓN Y SANITIZACIÓN DEL BODY
   ============================================================ */
function normalizarBodyProducto(body) {
  return {
    codigo: body.codigo,
    nombre: body.nombre,
    descripcion: body.descripcion || "",
    precio: Number(body.precio) || 0,
    stock_actual: Number(body.stock_actual) || 0,
    stock_minimo: Number(body.stock_minimo) || 0,
    unidad_medida: body.unidad_medida || "unidad",
    id_categoria: body.id_categoria ? Number(body.id_categoria) : null
  };
}


exports.crear = async (req, res) => {
  try {
    const data = normalizarBodyProducto(req.body);

    if (!data.id_categoria) {
      return res.status(400).json({ error: "La categoría es obligatoria" });
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


exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const data = normalizarBodyProducto(req.body);

    await Producto.update(data, { where: { id_producto: id } });

    const p = await Producto.findByPk(id);

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


async function evaluarAlerta(prod) {
  try {
    if (!prod) return;

    if (prod.stock_actual <= prod.stock_minimo) {
      await Alerta.create({
        id_producto: prod.id_producto,
        tipo: 'Stock Bajo',
        mensaje: `Stock actual ${prod.stock_actual} ≤ mínimo ${prod.stock_minimo}`
      });
    }
  } catch (e) {
    console.error("❌ Error evaluando alerta:", e);
  }
}
