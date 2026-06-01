const {
  Producto,
  Categoria,
  ImagenProducto,
  Alerta,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");
const registrarAccion = require("../middlewares/auditoria");
const XLSX = require("xlsx");
const AdmZip = require("adm-zip");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, publicUrl } = require("../utils/s3");
const fs = require("fs");
const BUCKET = process.env.AWS_S3_BUCKET;

// =========================
// 📦 LISTAR PRODUCTOS
// =========================
exports.listar = async (req, res) => {
  try {
    const { q, categoria, stock, page = 1, limit = 9 } = req.query;

    const where = {};
    if (q) where.nombre = { [Op.iLike]: `%${q}%` };
    if (categoria) where.id_categoria = Number(categoria);
    if (stock === "bajo") {
  where[Op.and] = [
    sequelize.where(
      sequelize.col("Producto.stock_actual"),
      Op.lte,
      sequelize.col("Producto.stock_minimo")
    ),
  ];
}

if (stock === "medio") {
  where[Op.and] = [
    sequelize.where(
      sequelize.col("Producto.stock_actual"),
      Op.gt,
      sequelize.col("Producto.stock_minimo")
    ),
    sequelize.where(
      sequelize.literal(`"Producto"."stock_actual" - "Producto"."stock_minimo"`),
      Op.lt,
      30
    ),
  ];
}

if (stock === "alto") {
  where[Op.and] = [
    sequelize.where(
      sequelize.literal(`"Producto"."stock_actual" - "Producto"."stock_minimo"`),
      Op.gte,
      30
    ),
  ];
}

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 9, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [
        {
          model: Categoria,
          as: "Categoria",
          attributes: ["nombre"],
          required: false,
        },
        {
          model: ImagenProducto,
          attributes: ["url", "es_principal"],
          where: { es_principal: true },
          required: false,
        },
      ],
      order: [["id_producto", "DESC"]],
      limit: limitNum,
      offset,
    });

    const data = rows.map((p) => ({
      ...p.toJSON(),
      imagen_principal: p.ImagenProductos?.[0]?.url || null,
    }));

    res.json({
      total: count,
      paginas: Math.max(Math.ceil(count / limitNum), 1),
      page: pageNum,
      limit: limitNum,
      data,
    });
  } catch (error) {
    console.error("❌ Error al listar productos:", error);
    res.status(500).json({ error: "Error al listar productos" });
  }
};

// =========================
// 🧽 NORMALIZAR BODY CREAR
// =========================
function normalizarBodyCrear(body) {
  return {
    codigo: body.codigo ? String(body.codigo).trim() : "",
    nombre: body.nombre ? String(body.nombre).trim() : "",
    descripcion: body.descripcion || "",
    precio: body.precio !== undefined ? Number(body.precio) : 0,
    stock_actual:
      body.stock_actual !== undefined ? Number(body.stock_actual) : 0,
    stock_minimo:
      body.stock_minimo !== undefined ? Number(body.stock_minimo) : 0,
    unidad_medida: body.unidad_medida || "unidad",
    id_categoria: body.id_categoria ? Number(body.id_categoria) : null,
  };
}

// =========================
// 🧽 NORMALIZAR BODY ACTUALIZAR
// =========================
function normalizarBodyActualizar(body) {
  const data = {};

  if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
  if (body.descripcion !== undefined) data.descripcion = body.descripcion || "";
  if (body.precio !== undefined) data.precio = Number(body.precio);
  if (body.stock_minimo !== undefined)
    data.stock_minimo = Number(body.stock_minimo);
  if (body.unidad_medida !== undefined)
    data.unidad_medida = body.unidad_medida || "unidad";

  if (body.id_categoria !== undefined) {
    data.id_categoria = body.id_categoria ? Number(body.id_categoria) : null;
  }

  if (body.codigo !== undefined) data.codigo = String(body.codigo).trim();
  if (body.stock_actual !== undefined)
    data.stock_actual = Number(body.stock_actual);

  return data;
}

// =========================
// ➕ CREAR PRODUCTO
// =========================
exports.crear = async (req, res) => {
  try {
    const data = normalizarBodyCrear(req.body);

    if (!data.id_categoria) {
      return res.status(400).json({ error: "La categoría es obligatoria" });
    }

    if (!data.codigo) {
      return res.status(400).json({ error: "El código es obligatorio" });
    }

    if (!data.nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const existe = await Producto.findOne({
      where: { codigo: data.codigo },
    });

    if (existe) {
      return res
        .status(400)
        .json({ error: "Ya existe un producto con ese código" });
    }

    const p = await Producto.create(data);

    await registrarAccion(
      req.user.id_usuario,
      "CREAR",
      `Agregó producto '${p.nombre}' al inventario`
    );

    await evaluarAlerta(p);

    res.status(201).json({ id_producto: p.id_producto });
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
};

// =========================
// ✏️ ACTUALIZAR PRODUCTO
// =========================
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalizarBodyActualizar(req.body);

    delete data.codigo;
    delete data.stock_actual;

    await Producto.update(data, { where: { id_producto: id } });

    const p = await Producto.findByPk(id);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });

    await registrarAccion(
      req.user.id_usuario,
      "ACTUALIZAR",
      `Actualizó producto '${p.nombre}'`
    );

    await evaluarAlerta(p);

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

// =========================
// 🗑️ ELIMINAR PRODUCTO
// =========================
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const p = await Producto.findByPk(id);

    await registrarAccion(
      req.user.id_usuario,
      "CONFIGURACION",
      `Eliminó producto '${p?.nombre || id}'`
    );

    await Producto.destroy({ where: { id_producto: id } });

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
};

// =========================
// 🔎 OBTENER PRODUCTO POR CÓDIGO
// =========================
exports.obtenerPorCodigo = async (req, res) => {
  try {
    const codigoLimpio = String(req.params.codigo || "").trim();

    if (!codigoLimpio) {
      return res.status(400).json({ error: "Código inválido" });
    }

    const p = await Producto.findOne({
      where: { codigo: codigoLimpio },
      include: [
        {
          model: Categoria,
          as: "Categoria",
          attributes: ["nombre"],
          required: false,
        },
        {
          model: ImagenProducto,
          attributes: ["url", "es_principal"],
          where: { es_principal: true },
          required: false,
        },
      ],
    });

    if (!p) return res.status(404).json({ error: "Producto no encontrado" });

    return res.json({
      ...p.toJSON(),
      imagen_principal: p.ImagenProductos?.[0]?.url || null,
    });
  } catch (error) {
    console.error("❌ Error obteniendo producto por código:", error);
    return res
      .status(500)
      .json({ error: "Error al buscar producto por código" });
  }
};

// =========================
// HELPERS IMPORTACIÓN
// =========================
function limpiarPrecio(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;

  return (
    Number(
      String(valor)
        .replace("S/", "")
        .replace("s/", "")
        .replace("S", "")
        .replace(",", ".")
        .trim()
    ) || 0
  );
}

function normalizarArchivo(nombre) {
  return String(nombre || "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .trim()
    .toLowerCase();
}

function contentTypePorExtension(filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpeg") return "image/jpeg";
  if (ext === ".jpg") return "image/jpeg";

  return "application/octet-stream";
}

function buscarImagenEnZip(zipEntries, codigo, imagenArchivo) {
  const mapa = new Map();

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    const filename = normalizarArchivo(entry.entryName);
    mapa.set(filename, entry);
  }

  if (imagenArchivo) {
    const buscado = normalizarArchivo(imagenArchivo);
    if (mapa.has(buscado)) return mapa.get(buscado);
  }

  const codigoLimpio = String(codigo).trim().toLowerCase();
  const extensiones = [".jpg", ".jpeg", ".png", ".webp"];

  for (const ext of extensiones) {
    const posible = `${codigoLimpio}${ext}`;
    if (mapa.has(posible)) return mapa.get(posible);
  }

  return null;
}

async function subirImagenBufferAS3(buffer, filename) {
  if (!BUCKET) {
    throw new Error("No se encontró AWS_S3_BUCKET en .env");
  }

  const safeName = String(filename || "producto.jpg")
    .replace(/\s+/g, "_")
    .replace(/[^\w.\-]/g, "");

  const key = `products/import/${Date.now()}_${safeName}`;
  const mimetype = contentTypePorExtension(safeName);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return publicUrl(BUCKET, key);
}

// =========================
// 📥 IMPORTAR PRODUCTOS EXCEL + ZIP
// =========================
exports.importarProductos = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const excelFile = req.files?.file?.[0] || req.file;
    const zipFile = req.files?.imagenes?.[0];

    if (!excelFile) {
      await t.rollback();
      return res.status(400).json({ error: "Debes subir un archivo Excel" });
    }

    let zipEntries = [];

    if (zipFile) {
      const zip = new AdmZip(zipFile.buffer);
      zipEntries = zip.getEntries();
    }

    const workbook = XLSX.read(excelFile.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });

    if (!rows.length) {
      await t.rollback();
      return res.status(400).json({ error: "El archivo está vacío" });
    }

    const creados = [];
    const errores = [];

    for (let i = 0; i < rows.length; i++) {
      const fila = rows[i];
      const numeroFila = i + 2;

      try {
        const codigo = String(fila.codigo || "").trim();
        const nombre = String(fila.nombre || "").trim();
        const descripcion = String(fila.descripcion || "").trim();
        const unidad_medida = String(fila.unidad_medida || "unidad").trim();

        const precio = limpiarPrecio(fila.precio);
        const stock_actual = Number(fila.stock_actual || 0);
        const stock_minimo = Number(fila.stock_minimo || 0);

        const categoriaNombre = String(fila.categoria || "").trim();
        const idCategoriaExcel = fila.id_categoria
          ? Number(fila.id_categoria)
          : null;

        const imagen_url = String(fila.imagen_url || "").trim();
        const imagen_archivo = String(fila.imagen_archivo || "").trim();

        if (!codigo || !nombre) {
          errores.push({
            fila: numeroFila,
            error: "Código y nombre son obligatorios",
          });
          continue;
        }

        const existe = await Producto.findOne({
          where: { codigo },
          transaction: t,
        });

        if (existe) {
          errores.push({
            fila: numeroFila,
            codigo,
            error: "Código duplicado",
          });
          continue;
        }

        let id_categoria = idCategoriaExcel;

        if (!id_categoria && categoriaNombre) {
          const categoria = await Categoria.findOne({
            where: {
              nombre: { [Op.iLike]: categoriaNombre },
            },
            transaction: t,
          });

          if (!categoria) {
            errores.push({
              fila: numeroFila,
              codigo,
              categoria: categoriaNombre,
              error: "Categoría no existe",
            });
            continue;
          }

          id_categoria = categoria.id_categoria;
        }

        if (!id_categoria) {
          errores.push({
            fila: numeroFila,
            codigo,
            error: "Debe enviar categoria o id_categoria",
          });
          continue;
        }

        const producto = await Producto.create(
          {
            codigo,
            nombre,
            descripcion,
            precio,
            stock_actual,
            stock_minimo,
            unidad_medida,
            estado: true,
            id_categoria,
          },
          { transaction: t }
        );

        let urlImagenFinal = imagen_url;

        if (!urlImagenFinal && zipEntries.length > 0) {
          const entry = buscarImagenEnZip(zipEntries, codigo, imagen_archivo);

          if (entry) {
            const buffer = entry.getData();
            const filename = normalizarArchivo(entry.entryName);
            urlImagenFinal = await subirImagenBufferAS3(buffer, filename);
          }
        }

        if (urlImagenFinal) {
          await ImagenProducto.create(
            {
              id_producto: producto.id_producto,
              url: urlImagenFinal,
              es_principal: true,
            },
            { transaction: t }
          );
        }

        if (stock_actual <= stock_minimo) {
          await Alerta.create(
            {
              id_producto: producto.id_producto,
              tipo: "Stock Bajo",
              mensaje: `Stock actual ${stock_actual} ≤ mínimo ${stock_minimo}`,
            },
            { transaction: t }
          );
        }

        creados.push({
          id_producto: producto.id_producto,
          codigo,
          nombre,
          imagen: urlImagenFinal || null,
        });
      } catch (filaError) {
        errores.push({
          fila: numeroFila,
          error: filaError.message,
        });
      }
    }

    await t.commit();

    await registrarAccion(
      req.user.id_usuario,
      "IMPORTAR",
      `Importó ${creados.length} productos desde Excel`
    );

    return res.json({
      ok: true,
      message: "Importación finalizada",
      total_filas: rows.length,
      creados: creados.length,
      errores,
      productos: creados,
    });
  } catch (error) {
    await t.rollback();

    console.error("❌ Error importando productos:", error);

    return res.status(500).json({
      error: "Error importando productos",
      detalle: error.message,
    });
  }
};

// =========================
// 🔔 EVALUAR ALERTA STOCK BAJO
// =========================
async function evaluarAlerta(prod) {
  try {
    if (!prod) return;

    if (prod.stock_actual <= prod.stock_minimo) {
      await Alerta.create({
        id_producto: prod.id_producto,
        tipo: "Stock Bajo",
        mensaje: `Stock actual ${prod.stock_actual} ≤ mínimo ${prod.stock_minimo}`,
      });
    }
  } catch (e) {
    console.error("❌ Error evaluando alerta:", e);
  }
}