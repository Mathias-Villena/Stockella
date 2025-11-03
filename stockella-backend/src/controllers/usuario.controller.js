const bcrypt = require('bcrypt');
const { Usuario, Rol } = require('../models');
const { Op } = require('sequelize');

// ==========================
// LISTAR USUARIOS PAGINADOS
// ==========================
exports.listar = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    const where = {};
    if (q) {
      // Buscar por nombre o email
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    // Consulta con paginación
    const { count, rows } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, attributes: ['nombre'] }],
      order: [['id_usuario', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json({
      total: count,
      paginas: Math.max(Math.ceil(count / limitNum), 1),
      page: pageNum,
      limit: limitNum,
      data: rows,
    });
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
    res.status(500).json({ error: 'Error listando usuarios' });
  }
};

// ==========================
// CREAR USUARIO
// ==========================
exports.crear = async (req, res) => {
  const { nombre, email, password, id_rol, estado = true } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const nuevo = await Usuario.create({ nombre, email, password: hash, id_rol, estado });
  res.status(201).json({ id_usuario: nuevo.id_usuario });
};

// ==========================
// ACTUALIZAR USUARIO
// ==========================
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);
  await Usuario.update(payload, { where: { id_usuario: id } });
  res.json({ ok: true });
};

// ==========================
// ELIMINAR USUARIO
// ==========================
exports.eliminar = async (req, res) => {
  const { id } = req.params;
  await Usuario.destroy({ where: { id_usuario: id } });
  res.json({ ok: true });
};
