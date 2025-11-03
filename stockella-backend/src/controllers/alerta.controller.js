const { Alerta, Producto } = require("../models");
const { Op } = require("sequelize");

// ===============================
// Obtener todas las alertas
// ===============================
exports.listar = async (req, res) => {
  try {
    const { tipo, atendida } = req.query;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (atendida !== undefined) where.atendida = atendida === "true";

    const alertas = await Alerta.findAll({
      where,
      include: [{ model: Producto, attributes: ["nombre", "codigo"] }],
      order: [["fecha", "DESC"]],
    });

    res.json(alertas);
  } catch (err) {
    console.error("❌ Error al listar alertas:", err);
    res.status(500).json({ error: "Error al obtener alertas" });
  }
};

// ===============================
// Marcar alerta como atendida
// ===============================
exports.marcarAtendida = async (req, res) => {
  try {
    const { id } = req.params;
    const alerta = await Alerta.findByPk(id);

    if (!alerta) return res.status(404).json({ error: "Alerta no encontrada" });

    await alerta.update({ atendida: true });
    res.json({ mensaje: "Alerta marcada como atendida", alerta });
  } catch (err) {
    console.error("❌ Error al actualizar alerta:", err);
    res.status(500).json({ error: "Error al actualizar alerta" });
  }
};
