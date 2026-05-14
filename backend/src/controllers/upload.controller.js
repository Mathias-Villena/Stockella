const { s3, PutObjectCommand, DeleteObjectCommand, publicUrl } = require("../utils/s3");
const { v4: uuid } = require("uuid");
const { ImagenProducto, DatasetML, Producto } = require("../models");
const registrarAccion = require("../middlewares/auditoria");

const BUCKET = process.env.AWS_S3_BUCKET;

const normalizarEtiqueta = (texto) =>
  String(texto || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

// ===============================
// Imagen principal del producto
// Reemplaza imagen anterior
// ===============================
exports.subirImagenProducto = async (req, res) => {
  try {
    const { id_producto } = req.body;

    if (!id_producto) return res.status(400).json({ error: "id_producto es requerido" });
    if (!req.file) return res.status(400).json({ error: "Archivo requerido" });

    const producto = await Producto.findByPk(id_producto);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const imagenExistente = await ImagenProducto.findOne({
      where: { id_producto, es_principal: true },
    });

    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `products/${id_producto}/main_${uuid()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = publicUrl(BUCKET, key);

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

      await registrarAccion(
        req.user.id_usuario,
        "ACTUALIZAR",
        `Actualizó imagen principal del producto '${producto.nombre}'`
      );
    } else {
      await ImagenProducto.create({
        id_producto,
        url,
        es_principal: true,
      });

      await registrarAccion(
        req.user.id_usuario,
        "CREAR",
        `Agregó imagen principal al producto '${producto.nombre}'`
      );
    }

    return res.status(201).json({ url, key });
  } catch (e) {
    console.error("❌ Error subiendo imagen principal:", e);
    return res.status(500).json({ error: "Error al subir imagen principal" });
  }
};

// ===============================
// Imagen para dataset ML
// NO reemplaza ni borra imágenes anteriores
// ===============================
exports.subirImagenDataset = async (req, res) => {
  try {
    const { id_producto, etiqueta, fuente } = req.body;

    if (!id_producto) return res.status(400).json({ error: "id_producto es requerido" });
    if (!req.file) return res.status(400).json({ error: "Archivo requerido" });

    const producto = await Producto.findByPk(id_producto);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `dataset/${id_producto}/${normalizarEtiqueta(etiqueta || producto.nombre)}_${uuid()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = publicUrl(BUCKET, key);

    await DatasetML.create({
      id_producto,
      imagen_url: url,
      etiqueta: normalizarEtiqueta(etiqueta || producto.nombre),
      fuente: fuente?.trim() || "Admin",
    });

    await registrarAccion(
      req.user.id_usuario,
      "CREAR",
      `Agregó imagen al dataset ML para el producto '${producto.nombre}'`
    );

    return res.status(201).json({ url, key });
  } catch (e) {
    console.error("❌ Error subiendo imagen al dataset:", e);
    return res.status(500).json({ error: "Error al subir imagen al dataset" });
  }
};

exports.subirEvidenciaMovil = async (req, res) => {
  try {
    const { tipo = "ml" } = req.body;

    if (!req.file) return res.status(400).json({ error: "Archivo requerido" });

    const ext = (req.file.mimetype.split("/")[1] || "jpg").toLowerCase();
    const key = `evidencias/${tipo}/${req.user.id_usuario}/${uuid()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = publicUrl(BUCKET, key);

    await registrarAccion(
      req.user.id_usuario,
      "CREAR",
      `Subió evidencia móvil (${tipo})`
    );

    return res.status(201).json({ url, key });
  } catch (e) {
    console.error("❌ Error subiendo evidencia móvil:", e);
    return res.status(500).json({ error: "Error al subir evidencia" });
  }
};