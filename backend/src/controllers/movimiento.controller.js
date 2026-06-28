// controllers/movimiento.controller.js
const { Movimiento, Producto, Usuario, Alerta, ImagenProducto, sequelize } = require("../models");
const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");

// =========================
// 📦 LISTAR MOVIMIENTOS
// =========================
exports.listar = async (req, res) => {
  try {
    const { tipo, producto, fechaInicio, fechaFin } = req.query;

    const where = {};

    if (tipo) where.tipo = tipo; // "Entrada" | "Salida"
    if (producto) where.id_producto = Number(producto);

    // Fechas (ISO recomendado: YYYY-MM-DD)
    if (fechaInicio && fechaFin) {
      where.fecha = { [Op.between]: [new Date(fechaInicio), new Date(fechaFin)] };
    } else if (fechaInicio) {
      where.fecha = { [Op.gte]: new Date(fechaInicio) };
    } else if (fechaFin) {
      where.fecha = { [Op.lte]: new Date(fechaFin) };
    }

    const movimientos = await Movimiento.findAll({
      where,
      include: [
        {
          model: Producto,
          attributes: ["nombre", "id_producto", "codigo"],
          include: [
            {
              model: ImagenProducto,
              attributes: ["url", "es_principal"],
              where: { es_principal: true },
              required: false,
            },
          ],
        },
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
  const t = await sequelize.transaction();
  try {
    const { id_producto, tipo, cantidad, motivo, evidencia_url } = req.body;
    const id_usuario = req.user?.id_usuario;

    if (!id_usuario) {
      await t.rollback();
      return res.status(401).json({ error: "No autorizado (token inválido)" });
    }

    const idProdNum = Number(id_producto);
    if (!Number.isInteger(idProdNum) || idProdNum <= 0) {
      await t.rollback();
      return res.status(400).json({ error: "id_producto inválido" });
    }

    const qty = Number(cantidad);
    if (!Number.isInteger(qty) || qty <= 0) {
      await t.rollback();
      return res.status(400).json({ error: "Cantidad debe ser un entero mayor a 0" });
    }

    if (tipo !== "Entrada" && tipo !== "Salida") {
      await t.rollback();
      return res.status(400).json({ error: "Tipo inválido (Entrada o Salida)" });
    }

    // 🔒 Lock para evitar concurrencia (PostgreSQL)
    const prod = await Producto.findByPk(idProdNum, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!prod) {
      await t.rollback();
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const oldStock = Number(prod.stock_actual) || 0;
    const stockMin = Number(prod.stock_minimo) || 0;

    let newStock = oldStock;

    if (tipo === "Entrada") {
      newStock = oldStock + qty;
    } else {
      // Salida
      if (oldStock < qty) {
        await t.rollback();
        return res.status(400).json({ error: "Stock insuficiente para salida" });
      }
      newStock = oldStock - qty;
    }

    // 1) Guardar movimiento
    const movimiento = await Movimiento.create(
      {
        id_producto: idProdNum,
        id_usuario,
        tipo,
        cantidad: qty,
        motivo: motivo || null,
        evidencia_url: evidencia_url || null,
        fecha: new Date(),
      },
      { transaction: t }
    );

    // 2) Actualizar stock del producto
    await prod.update({ stock_actual: newStock }, { transaction: t });

    // 3) Generar alerta si stock bajo (evitando duplicados)
    if (newStock <= stockMin) {
      const alertaExistente = await Alerta.findOne({
        where: { id_producto: idProdNum, tipo: "Stock Bajo", atendida: false },
        transaction: t,
      });

      if (!alertaExistente) {
        await Alerta.create(
          {
            id_producto: idProdNum,
            tipo: "Stock Bajo",
            mensaje: `El producto "${prod.nombre}" tiene stock bajo (${newStock})`,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // 4) Auditoría (fuera de la transacción de inventario está OK)
    await registrarAccion(
      id_usuario,
      "ACTUALIZAR",
      `Modificó stock de '${prod.nombre}' de ${oldStock} → ${newStock} (${tipo} ${qty})`
    );

    res.status(201).json({
      message: "Movimiento registrado correctamente",
      movimiento,
      stock_anterior: oldStock,
      stock_nuevo: newStock,
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al registrar movimiento:", error);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
};