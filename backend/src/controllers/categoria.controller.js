const { Categoria, Producto } = require("../models");
const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");

// =========================
// 📂 LISTAR CATEGORÍAS
// =========================
exports.listar = async (req, res) => {
  try {
    const { q } = req.query;

    const where = {};

    if (q) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { descripcion: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const categorias = await Categoria.findAll({
      where,
      attributes: ["id_categoria", "nombre", "descripcion"],
      order: [["id_categoria", "ASC"]],
    });

    const data = categorias.map((c) => ({
      id_categoria: c.id_categoria,
      id: c.id_categoria,
      nombre: c.nombre,
      descripcion: c.descripcion,
    }));

    res.json(data);
  } catch (error) {
    console.error("❌ Error al listar categorías:", error);
    res.status(500).json({ error: "Error al listar categorías" });
  }
};

// =========================
// ➕ CREAR CATEGORÍA
// =========================
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion?.trim() || null;

    const existe = await Categoria.findOne({
      where: { nombre: { [Op.iLike]: nombreLimpio } },
    });

    if (existe) {
      return res.status(400).json({ error: "La categoría ya existe" });
    }

    const categoria = await Categoria.create({
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
    });

    await registrarAccion(
      req.user.id_usuario,
      "CREAR",
      `Creó categoría '${nombreLimpio}'`
    );

    res.status(201).json({
      id_categoria: categoria.id_categoria,
      id: categoria.id_categoria,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    });
  } catch (error) {
    console.error("❌ Error al crear categoría:", error);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

// =========================
// ✏️ ACTUALIZAR CATEGORÍA
// =========================
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion?.trim() || null;

    const duplicada = await Categoria.findOne({
      where: {
        nombre: { [Op.iLike]: nombreLimpio },
        id_categoria: { [Op.ne]: id },
      },
    });

    if (duplicada) {
      return res.status(400).json({
        error: "Ya existe otra categoría con ese nombre",
      });
    }

    await categoria.update({
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
    });

    await registrarAccion(
      req.user.id_usuario,
      "ACTUALIZAR",
      `Actualizó categoría ID ${id} a '${nombreLimpio}'`
    );

    res.json({
      id_categoria: categoria.id_categoria,
      id: categoria.id_categoria,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    });
  } catch (error) {
    console.error("❌ Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

// =========================
// 🗑️ ELIMINAR CATEGORÍA
// =========================
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const productosAsociados = await Producto.count({
      where: { id_categoria: id },
    });

    if (productosAsociados > 0) {
      return res.status(400).json({
        error:
          "No se puede eliminar la categoría porque tiene productos asociados",
      });
    }

    await categoria.destroy();

    await registrarAccion(
      req.user.id_usuario,
      "ELIMINAR",
      `Eliminó categoría '${categoria.nombre}'`
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};