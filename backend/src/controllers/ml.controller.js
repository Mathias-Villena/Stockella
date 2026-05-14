const axios = require("axios");
const registrarAccion = require("../middlewares/auditoria");

exports.predict = async (req, res) => {
  try {
    const { imagen_url } = req.body;

    if (!imagen_url) {
      return res.status(400).json({ error: "Debes enviar imagen_url" });
    }

    const mlUrl = process.env.ML_URL; // ej: http://localhost:8000

    // ✅ Si aún no tienes ML, devolvemos mock para avanzar Flutter
    if (!mlUrl) {
      await registrarAccion(
        req.user.id_usuario,
        "ML_PREDICT_MOCK",
        `Predict mock (sin ML_URL) para ${imagen_url}`
      );

      return res.json({
        mock: true,
        top1: { id_producto: 1, nombre: "Producto Demo", prob: 0.75 },
        top3: [
          { id_producto: 1, nombre: "Producto Demo", prob: 0.75 },
          { id_producto: 2, nombre: "Producto Demo 2", prob: 0.15 },
          { id_producto: 3, nombre: "Producto Demo 3", prob: 0.10 },
        ],
      });
    }

    // ✅ Llamada real al ML service
    const response = await axios.post(
      `${mlUrl}/predict`,
      { imagen_url },
      { timeout: 8000 }
    );

    await registrarAccion(
      req.user.id_usuario,
      "ML_PREDICT",
      `Predict ML para ${imagen_url}`
    );

    return res.json(response.data);
  } catch (error) {
    console.error("❌ Error en ML predict:", error?.message || error);
    return res.status(502).json({
      error: "Servicio ML no disponible",
      detalle: error?.message || "Error desconocido",
    });
  }
};