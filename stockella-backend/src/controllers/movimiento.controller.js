const { Movimiento, Producto, Usuario, Alerta } = require("../models");
const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");

// =========================
// 📦 LISTAR MOVIMIENTOS
// =========================
exports.listar = async (req, res) => {
  try {
    const { tipo, producto, fechaInicio, fechaFin } = req.query;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (producto) where.id_producto = producto;
    if (fechaInicio && fechaFin)
      where.fecha = { [Op.between]: [fechaInicio, fechaFin] };
    else if (fechaInicio)
      where.fecha = { [Op.gte]: fechaInicio };
    else if (fechaFin)
      where.fecha = { [Op.lte]: fechaFin };

    const movimientos = await Movimiento.findAll({
      where,
      include: [
        { model: Producto, attributes: ["nombre", "id_producto"] },
        { model: Usuario, attributes: ["nombre", "email"] },
      ],
      order: [["fecha", "DESC"]],
    });

    res.json(movimientos);
  } catch (error) {
    console.error("❌ Error al listar movimientos:", error);
    res.status(500).json({ error: "Error al listar movimientos" });
  }
};

// =========================
// ➕ CREAR MOVIMIENTO
// =========================
exports.crear = async (req, res) => {
  try {
    const { id_producto, tipo, cantidad, motivo } = req.body;
    const id_usuario = req.user?.id_usuario;

    // Validar existencia
    const prod = await Producto.findByPk(id_producto);
    if (!prod) return res.status(404).json({ error: "Producto no encontrado" });

    const oldStock = prod.stock_actual;
    let newStock = oldStock;

    // Actualizar stock según tipo
    if (tipo === "Entrada") {
      newStock += Number(cantidad);
    } else if (tipo === "Salida") {
      if (oldStock < cantidad) {
        return res.status(400).json({ error: "Stock insuficiente para salida" });
      }
      newStock -= Number(cantidad);
    } else {
      return res.status(400).json({ error: "Tipo inválido (Entrada o Salida)" });
    }

    // Guardar movimiento
    const movimiento = await Movimiento.create({
      id_producto,
      id_usuario,
      tipo,
      cantidad,
      motivo,
      fecha: new Date(),
    });

    // Actualizar producto
    await Producto.update(
      { stock_actual: newStock },
      { where: { id_producto } }
    );

    // Registrar auditoría
    await registrarAccion(
      id_usuario,
      "ACTUALIZAR",
      `Modificó stock de '${prod.nombre}' de ${oldStock} → ${newStock}`
    );

    // Generar alerta si stock bajo
    if (newStock <= prod.stock_minimo) {
      await Alerta.create({
        id_producto,
        tipo: "Stock Bajo",
        mensaje: `El producto "${prod.nombre}" tiene stock bajo (${newStock})`,
      });
    }

    res.status(201).json({
      message: "Movimiento registrado correctamente",
      movimiento,
    });
  } catch (error) {
    console.error("❌ Error al registrar movimiento:", error);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
};
