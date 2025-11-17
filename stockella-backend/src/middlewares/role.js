module.exports = (...rolesPermitidos) => {
  const roles = rolesPermitidos.flat().map(r => r.toString().toLowerCase());

  return (req, res, next) => {
    const rolUsuario = req.user?.rol?.toLowerCase();

    if (!rolUsuario) {
      return res.status(401).json({ message: "Rol no encontrado en token" });
    }

    if (!roles.includes(rolUsuario)) {
      return res.status(403).json({ message: "Acceso denegado: rol no autorizado" });
    }

    next();
  };
};

