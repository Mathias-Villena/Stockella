// src/middlewares/role.js
module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolUsuario = req.user?.rol;

    if (!rolUsuario) {
      return res.status(401).json({ message: 'Rol no encontrado en token' });
    }

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
    }

    next();
  };
};
