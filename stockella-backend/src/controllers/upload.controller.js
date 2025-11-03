const { s3, PutObjectCommand, publicUrl } = require("../utils/s3");
const { v4: uuid } = require("uuid");
const { ImagenProducto, DatasetML } = require("../models"); // ajusta nombres
const BUCKET = process.env.AWS_S3_BUCKET;

exports.subirImagenProducto = async (req, res) => {
  try {
    const { id_producto, comoDataset } = req.body; // "true" | "false"
    if (!req.file) return res.status(400).json({ error: "Archivo requerido" });

    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `products/${id_producto}/main_${Date.now()}_${uuid()}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read" // lectura pública (solo en la demo rápida)
    }));

    const url = publicUrl(BUCKET, key);

    // Guarda en tu tabla de imágenes (principal del producto)
    await ImagenProducto.create({
      id_producto,
      url,
      es_principal: true
    });

    // (Opcional) También alimentar dataset de ML
    if (comoDataset === "true") {
      await DatasetML.create({
        id_producto,
        imagen_url: url,
        etiqueta: String(id_producto),
        fuente: "Admin"
      });
    }

    res.status(201).json({ url, key });
  } catch (e) {
    console.error("❌ Error subiendo imagen:", e);
    res.status(500).json({ error: "Error subiendo imagen" });
  }
};
