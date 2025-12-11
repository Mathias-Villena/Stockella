const { Auditoria, Usuario } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async obtenerAuditoria(req, res) {
    try {
      const { usuario, accion, search } = req.query;
      const where = {};

      if (usuario) where.id_usuario = usuario;
      if (accion) where.accion = accion;
      if (search) {
        where.detalle = { [Op.iLike]: `%${search}%` };
      }

      const registros = await Auditoria.findAll({
        where,
        include: [
          {
            model: Usuario,
            attributes: ['nombre', 'email']
          }
        ],
        order: [['fecha', 'DESC']]
      });

      // 🔥🔥🔥 ESTA ES LA CLAVE 🔥🔥🔥
      res.json({
        data: registros,
        total: registros.length,
      });

    } catch (error) {
      console.error("❌ Error en obtenerAuditoria:", error);
      res.status(500).json({ message: "Error al obtener auditoría" });
    }
  },

  async obtenerResumen(req, res) {
    try {
      const total = await Auditoria.count();
      const creaciones = await Auditoria.count({ where: { accion: 'CREAR' } });
      const actualizaciones = await Auditoria.count({ where: { accion: 'ACTUALIZAR' } });
      const configuraciones = await Auditoria.count({ where: { accion: 'CONFIGURACION' } });

      res.json({
        total,
        creaciones,
        actualizaciones,
        configuraciones
      });

    } catch (error) {
      console.error("❌ Error en obtenerResumen:", error);
      res.status(500).json({ message: "Error al obtener resumen" });
    }
  }
};
