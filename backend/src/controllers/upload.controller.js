const { s3, PutObjectCommand, DeleteObjectCommand, publicUrl } = require("../utils/s3");
const { v4: uuid } = require("uuid");
const { ImagenProducto, DatasetML, Producto } = require("../models");
const registrarAccion = require("../middlewares/auditoria");
const BUCKET = process.env.AWS_S3_BUCKET;

exports.subirImagenProducto = async (req, res) => {
  try {
    const { id_producto, comoDataset } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    // Buscar producto para auditoría
    const producto = await Producto.findByPk(id_producto);

    // Ver imagen existente
    const imagenExistente = await ImagenProducto.findOne({
      where: { id_producto, es_principal: true },
    });

    // Crear nombre único
    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `products/${id_producto}/main_${uuid()}.${ext}`;

    // Subir nueva
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = publicUrl(BUCKET, key);

    // Si existe imagen previa → eliminar y reemplazar
    if (imagenExistente) {
      const oldKey = imagenExistente.url.split(".com/")[1];

      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: oldKey,
          })
        );
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar la imagen previa:", err.message);
      }

      imagenExistente.url = url;
      await imagenExistente.save();

      // AUDITORÍA — actualización de imagen
      await registrarAccion(
        req.user.id_usuario,
        "ACTUALIZAR",
        `Actualizó imagen principal del producto '${producto?.nombre}'`
      );

    } else {
      // Crear imagen principal nueva
      await ImagenProducto.create({
        id_producto,
        url,
        es_principal: true,
      });

      // AUDITORÍA — creación de imagen
      await registrarAccion(
        req.user.id_usuario,
        "CREAR",
        `Agregó imagen principal al producto '${producto?.nombre}'`
      );
    }

    // Si la imagen también es dataset
    if (comoDataset === "true") {
      await DatasetML.create({
        id_producto,
        imagen_url: url,
        etiqueta: String(id_producto),
        fuente: "Admin",
      });

      await registrarAccion(
        req.user.id_usuario,
        "CREAR",
        `Agregó dataset ML desde imagen para el producto '${producto?.nombre}'`
      );
    }

    res.status(201).json({ url });
  } catch (e) {
    console.error("❌ Error subiendo imagen:", e);
    res.status(500).json({ error: "Error al subir o actualizar imagen" });
  }
};
