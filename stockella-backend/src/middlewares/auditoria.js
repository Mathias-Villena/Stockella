const { Auditoria } = require('../models');

const registrarAccion = async (id_usuario, accion, detalle) => {
  try {
    await Auditoria.create({
      id_usuario,
      accion,
      detalle
    });
  } catch (error) {
    console.error("Error registrando auditoría:", error);
  }
};

// Middleware para usar dentro de controladores
module.exports = registrarAccion;
