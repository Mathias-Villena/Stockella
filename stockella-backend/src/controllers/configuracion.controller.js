const { Configuracion } = require("../models");
const registrarAccion = require("../middlewares/auditoria");

module.exports = {
  // 📌 LISTAR CONFIGURACIONES
  async listar(req, res) {
    try {
      const data = await Configuracion.findAll({
        order: [["id_config", "ASC"]],
      });

      res.json({ total: data.length, data });
    } catch (e) {
      console.error("❌ Error listando configuraciones:", e);
      res.status(500).json({ error: "Error al obtener configuraciones" });
    }
  },

  // 📌 CREAR PARÁMETRO
  async crear(req, res) {
    try {
      const { clave, valor, descripcion } = req.body;
      const id_usuario = req.user.id_usuario;

      // Validación única
      const existe = await Configuracion.findOne({ where: { clave } });
      if (existe) {
        return res.status(400).json({ error: "La clave ya existe" });
      }

      const nuevo = await Configuracion.create({ clave, valor, descripcion });

      await registrarAccion(id_usuario, "CONFIGURACION", `Creó parámetro '${clave}'`);

      res.status(201).json(nuevo);
    } catch (e) {
      console.error("❌ Error creando configuración:", e);
      res.status(500).json({ error: "Error al crear configuración" });
    }
  },

  // 📌 ACTUALIZAR PARÁMETRO
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { clave, valor, descripcion } = req.body;
      const id_usuario = req.user.id_usuario;

      const conf = await Configuracion.findByPk(id);
      if (!conf) return res.status(404).json({ error: "Parámetro no encontrado" });

      await conf.update({ clave, valor, descripcion });

      await registrarAccion(id_usuario, "CONFIGURACION", `Actualizó parámetro '${clave}'`);

      res.json(conf);
    } catch (e) {
      console.error("❌ Error actualizando configuración:", e);
      res.status(500).json({ error: "Error al actualizar configuración" });
    }
  },

  // 📌 ELIMINAR PARÁMETRO
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user.id_usuario;

      const conf = await Configuracion.findByPk(id);
      if (!conf) return res.status(404).json({ error: "Parámetro no encontrado" });

      await registrarAccion(id_usuario, "CONFIGURACION", `Eliminó parámetro '${conf.clave}'`);

      await conf.destroy();

      res.json({ message: "Parámetro eliminado" });
    } catch (e) {
      console.error("❌ Error eliminando parámetro:", e);
      res.status(500).json({ error: "Error al eliminar configuración" });
    }
  },
};
