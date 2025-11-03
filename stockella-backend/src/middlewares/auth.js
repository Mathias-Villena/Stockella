// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contiene { id_usuario, email, rol }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
