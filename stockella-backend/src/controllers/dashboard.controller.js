const {
  Producto,
  Usuario,
  Movimiento,
  Alerta,
  Categoria,
} = require("../models");
const { Op, literal, fn, col } = require("sequelize");

exports.resumen = async (_req, res) => {
  try {
    // 1️⃣ Cards principales
    const [totalProductos, totalUsuarios, totalAlertas, movimientosHoy] =
      await Promise.all([
        Producto.count({ where: { estado: true } }),
        Usuario.count({ where: { estado: true } }),
        Alerta.count({ where: { atendida: false } }),
        Movimiento.count({ where: literal(`DATE("fecha") = CURRENT_DATE`) }),
      ]);

    // 2️⃣ Stock por categoría (gráfico barras)
const stockPorCategoria = await Producto.findAll({
  attributes: [
    [col("Producto.id_categoria"), "id_categoria"],
    [fn("SUM", col("Producto.stock_actual")), "total"],
  ],
  include: [
    {
      model: Categoria,
      as: "Categoria",
      attributes: ["nombre"],
    },
  ],
  group: [
    "Producto.id_categoria",
    "Categoria.id_categoria",
    "Categoria.nombre",
  ],
  order: [[literal("total"), "DESC"]],
});

const categoriasFormateado = stockPorCategoria.map((c) => ({
  categoria: c.Categoria?.nombre || "Sin categoría",
  total: Number(c.dataValues.total) || 0,
}));



    // 3️⃣ Estado de alertas (torta)
    const [stockBajo, agotados, ok] = await Promise.all([
      Alerta.count({ where: { tipo: "Stock Bajo", atendida: false } }),
      Producto.count({ where: { stock_actual: 0 } }),
      Producto.count({ where: { stock_actual: { [Op.gt]: 0 } } }),
    ]);

    const estadoAlertas = {
      stock_bajo: stockBajo,
      agotados,
      ok,
    };

    // 4️⃣ Movimientos de la semana (líneas)
    const movimientosSemana = await Movimiento.findAll({
      attributes: [
        [fn("TO_CHAR", col("fecha"), "Dy"), "dia"],
        "tipo",
        [fn("SUM", col("cantidad")), "total"],
      ],
      where: literal(`fecha >= CURRENT_DATE - INTERVAL '6 days'`),
      group: ["tipo", literal(`TO_CHAR("fecha", 'Dy')`)],
      order: [[literal(`MIN("fecha")`), "ASC"]],
    });

    const diasBase = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const entradas = diasBase.map((d) => {
      const match = movimientosSemana.find((m) => {
        const dia = m.dataValues.dia.replace(".", "").trim();
        return dia === d && m.tipo === "Entrada";
      });
      return Number(match?.dataValues.total || 0);
    });

    const salidas = diasBase.map((d) => {
      const match = movimientosSemana.find((m) => {
        const dia = m.dataValues.dia.replace(".", "").trim();
        return dia === d && m.tipo === "Salida";
      });
      return Number(match?.dataValues.total || 0);
    });

    res.json({
      cards: {
        productos: totalProductos,
        usuarios: totalUsuarios,
        alertas: totalAlertas,
        movimientosHoy,
      },
      stockPorCategoria: categoriasFormateado,
      estadoAlertas,
      movimientosSemana: {
        dias: diasBase,
        entradas,
        salidas,
      },
    });
  } catch (error) {
    console.error("❌ Error en dashboard:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
};
