const { Producto, Usuario, Movimiento, Alerta } = require('../models');
const { Op, literal } = require('sequelize');

exports.resumen = async (_req, res) => {
  try {
    const [totalProductos, totalUsuarios, totalAlertas, movimientosHoy] = await Promise.all([
      Producto.count({ where: { estado: true } }),
      Usuario.count({ where: { estado: true } }),
      Alerta.count({ where: { atendida: false } }),
      Movimiento.count({ where: literal(`DATE("fecha") = CURRENT_DATE`) }),
    ]);

    res.json({
      productos: totalProductos,
      usuarios: totalUsuarios,
      alertas: totalAlertas,
      movimientosHoy,
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen del dashboard:", error);
    res.status(500).json({ error: "Error al obtener los datos del dashboard" });
  }
};
