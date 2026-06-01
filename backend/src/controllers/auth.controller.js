// src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../models");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({
      where: { email },
      include: { model: Rol, attributes: ["nombre"] },
    });

    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const isOk = user.password.startsWith("$2b$")
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isOk) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.Rol?.nombre || "SinRol",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.Rol?.nombre,
      },
    });
  } catch (e) {
    console.error("❌ Error en login:", e);
    res.status(500).json({ message: "Error en login", error: e.message });
  }
};

// ==========================
// 👤 PERFIL LOGUEADO
// ==========================
exports.me = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id_usuario, {
      attributes: ["id_usuario", "nombre", "email", "estado"],
      include: [{ model: Rol, attributes: ["nombre"] }],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.Rol?.nombre,
      estado: user.estado,
    });
  } catch (e) {
    console.error("❌ Error obteniendo perfil:", e);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};

// ==========================
// ✏️ ACTUALIZAR PERFIL
// ==========================
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const user = await Usuario.findByPk(req.user.id_usuario, {
      include: [{ model: Rol, attributes: ["nombre"] }],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await user.update({
      nombre: nombre.trim(),
    });

    res.json({
      message: "Perfil actualizado correctamente",
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.Rol?.nombre,
      },
    });
  } catch (e) {
    console.error("❌ Error actualizando perfil:", e);
    res.status(500).json({ error: "Error actualizando perfil" });
  }
};

// ==========================
// 🔐 CAMBIAR CONTRASEÑA
// ==========================
exports.cambiarPassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res.status(400).json({
        error: "Contraseña actual y nueva son obligatorias",
      });
    }

    if (String(nueva).length < 6) {
      return res.status(400).json({
        error: "La nueva contraseña debe tener mínimo 6 caracteres",
      });
    }

    const user = await Usuario.findByPk(req.user.id_usuario);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordOk = user.password.startsWith("$2b$")
      ? await bcrypt.compare(actual, user.password)
      : actual === user.password;

    if (!passwordOk) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    const hash = await bcrypt.hash(nueva, 10);

    await user.update({
      password: hash,
    });

    res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (e) {
    console.error("❌ Error cambiando contraseña:", e);
    res.status(500).json({ error: "Error cambiando contraseña" });
  }
};
