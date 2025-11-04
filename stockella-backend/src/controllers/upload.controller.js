const { s3, PutObjectCommand, DeleteObjectCommand, publicUrl } = require("../utils/s3");
const { v4: uuid } = require("uuid");
const { ImagenProducto, DatasetML } = require("../models");
const BUCKET = process.env.AWS_S3_BUCKET;

exports.subirImagenProducto = async (req, res) => {
  try {
    const { id_producto, comoDataset } = req.body; // "true" | "false"

    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    // Verifica si existe una imagen principal previa
    const imagenExistente = await ImagenProducto.findOne({
      where: { id_producto, es_principal: true },
    });

    // Construir nombre único de archivo
    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `products/${id_producto}/main_${uuid()}.${ext}`;

    // Subir nueva imagen al bucket
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = publicUrl(BUCKET, key);

    // Si existía una imagen anterior, eliminarla del bucket
    if (imagenExistente) {
      const oldKey = imagenExistente.url.split(".com/")[1];
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: oldKey,
          })
        );
        console.log(`🧹 Imagen anterior eliminada: ${oldKey}`);
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar la imagen anterior:", err.message);
      }

      // Actualiza el registro en BD con la nueva URL
      imagenExistente.url = url;
      await imagenExistente.save();
    } else {
      // No existía: crea un nuevo registro
      await ImagenProducto.create({
        id_producto,
        url,
        es_principal: true,
      });
    }

    // Si viene como dataset de ML
    if (comoDataset === "true") {
      await DatasetML.create({
        id_producto,
        imagen_url: url,
        etiqueta: String(id_producto),
        fuente: "Admin",
      });
    }

    res.status(201).json({ url });
  } catch (e) {
    console.error("❌ Error subiendo imagen:", e);
    res.status(500).json({ error: "Error al subir o actualizar imagen" });
  }
};
