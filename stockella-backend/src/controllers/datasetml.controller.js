const { DatasetML, Producto } = require("../models");
const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");

exports.listar = async (req, res) => {
  try {
    const { q, producto, page = 1, limit = 12 } = req.query;

    const where = {};
    if (q) where.etiqueta = { [Op.iLike]: `%${q}%` };
    if (producto) where.id_producto = Number(producto);

    const p = Math.max(parseInt(page) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit) || 12, 1), 100);
    const offset = (p - 1) * l;

    const { count, rows } = await DatasetML.findAndCountAll({
      where,
      include: [{ model: Producto, attributes: ["nombre"] }],
      limit: l,
      offset,
      order: [["id_dataset", "DESC"]],
    });

    const data = rows.map((d) => ({
      ...d.toJSON(),
      producto: d.Producto?.nombre || "Sin producto",
    }));

    res.json({
      total: count,
      paginas: Math.ceil(count / l),
      page: p,
      limit: l,
      data,
    });
  } catch (e) {
    console.error("❌ Error listando dataset:", e);
    res.status(500).json({ error: "Error al listar dataset ML" });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    await registrarAccion(
      req.user.id_usuario,
      "CONFIGURACION",
      `Eliminó dataset con ID ${id}`
    );

    await DatasetML.destroy({ where: { id_dataset: id } });

    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error eliminando dataset:", e);
    res.status(500).json({ error: "Error al eliminar dataset ML" });
  }
};
