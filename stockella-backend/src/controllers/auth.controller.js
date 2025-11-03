// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario con su rol asociado
    const user = await Usuario.findOne({
      where: { email },
      include: { model: Rol, attributes: ['nombre'] }
    });

    if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

    // Permitir texto plano para el admin inicial, o bcrypt si ya está hasheado
    const isOk = user.password.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isOk) return res.status(400).json({ message: 'Credenciales inválidas' });

    // Generar token con el nombre del rol incluido
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.Rol?.nombre || 'SinRol'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Responder con token y datos del usuario
    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.Rol?.nombre
      }
    });
  } catch (e) {
    console.error('❌ Error en login:', e);
    res.status(500).json({ message: 'Error en login', error: e.message });
  }
};
