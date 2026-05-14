const { Reporte, Usuario, Producto, Movimiento, Categoria } = require("../models");
const registrarAccion = require("../middlewares/auditoria");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

function formatearFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerRangoPeriodo(periodo) {
  const ahora = new Date();
  const inicio = new Date();

  switch (periodo) {
    case "Hoy":
      inicio.setHours(0, 0, 0, 0);
      return { [Op.gte]: inicio };

    case "Esta semana": {
      const dia = inicio.getDay();
      const diff = dia === 0 ? 6 : dia - 1;
      inicio.setDate(inicio.getDate() - diff);
      inicio.setHours(0, 0, 0, 0);
      return { [Op.gte]: inicio };
    }

    case "Este mes":
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
      return { [Op.gte]: inicio };

    case "Este trimestre": {
      const mes = inicio.getMonth();
      const trimestreInicio = Math.floor(mes / 3) * 3;
      inicio.setMonth(trimestreInicio, 1);
      inicio.setHours(0, 0, 0, 0);
      return { [Op.gte]: inicio };
    }

    case "Este año":
      inicio.setMonth(0, 1);
      inicio.setHours(0, 0, 0, 0);
      return { [Op.gte]: inicio };

    default:
      return null;
  }
}

function obtenerConfigReporte(tipo, data) {
  switch (tipo) {
    case "Inventario General":
      return {
        headers: ["Código", "Producto", "Categoría", "Precio", "Stock Actual", "Stock Mínimo", "Unidad"],
        rows: data.map((p) => [
          p.codigo || "",
          p.nombre || "",
          p.Categoria?.nombre || "",
          Number(p.precio || 0).toFixed(2),
          p.stock_actual ?? "",
          p.stock_minimo ?? "",
          p.unidad_medida || "",
        ]),
      };

    case "Stock Bajo":
      return {
        headers: ["Código", "Producto", "Categoría", "Stock Actual", "Stock Mínimo"],
        rows: data.map((p) => [
          p.codigo || "",
          p.nombre || "",
          p.Categoria?.nombre || "",
          p.stock_actual ?? "",
          p.stock_minimo ?? "",
        ]),
      };

    case "Movimientos":
      return {
        headers: ["Fecha", "Producto", "Tipo", "Cantidad", "Motivo", "Usuario"],
        rows: data.map((m) => [
          formatearFecha(m.fecha),
          m.Producto?.nombre || "",
          m.tipo || "",
          m.cantidad ?? "",
          m.motivo || "",
          m.Usuario?.nombre || "",
        ]),
      };

    default:
      return {
        headers: ["Dato"],
        rows: data.map((item) => [JSON.stringify(item)]),
      };
  }
}

async function generarPDF(filepath, tipo, headers, rows) {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
  });

  doc.pipe(fs.createWriteStream(filepath));

  // Header
  doc.fontSize(24).fillColor("#2563EB").text("STOCKELLA", { align: "left" });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#2563EB").stroke();
  doc.moveDown(1.5);

  doc.fontSize(22).fillColor("black").text(`Reporte: ${tipo}`, { align: "center" });
  doc.moveDown(0.4);

  doc
    .fontSize(11)
    .fillColor("#4B5563")
    .text(`Generado el: ${new Date().toLocaleString("es-PE", {
      dateStyle: "long",
      timeStyle: "short",
    })}`, {
      align: "center",
    });

  doc.moveDown(1.5);

  // Tabla simple manual
  const startX = 40;
  let y = doc.y;
  const rowHeight = 24;
  const usableWidth = 515;
  const colWidth = usableWidth / headers.length;

  // Header tabla
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#1F2937");
  headers.forEach((header, i) => {
    doc.text(header, startX + i * colWidth, y, {
      width: colWidth - 4,
      align: "left",
    });
  });

  y += rowHeight;
  doc.moveTo(startX, y - 6).lineTo(startX + usableWidth, y - 6).strokeColor("#D1D5DB").stroke();

  // Rows
  doc.font("Helvetica").fontSize(9).fillColor("black");

  rows.forEach((row) => {
    if (y > 740) {
      doc.addPage();
      y = 50;
    }

    row.forEach((cell, i) => {
      doc.text(String(cell ?? ""), startX + i * colWidth, y, {
        width: colWidth - 4,
        align: "left",
      });
    });

    y += rowHeight;
  });

  doc.moveDown(2);
  doc.fontSize(10).fillColor("#6B7280").text("Generado por Stockella – Gestión Inteligente", {
    align: "center",
  });

  doc.end();
}

async function generarExcel(filepath, tipo, headers, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reporte");

  // Título
  sheet.mergeCells(1, 1, 1, headers.length);
  sheet.getCell(1, 1).value = `Reporte: ${tipo}`;
  sheet.getCell(1, 1).font = { size: 16, bold: true };
  sheet.getCell(1, 1).alignment = { horizontal: "center" };

  // Fecha
  sheet.mergeCells(2, 1, 2, headers.length);
  sheet.getCell(2, 1).value = `Generado el: ${new Date().toLocaleString("es-PE")}`;
  sheet.getCell(2, 1).alignment = { horizontal: "center" };

  // Header
  sheet.addRow([]);
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "2563EB" },
  };

  // Data
  rows.forEach((row) => {
    sheet.addRow(row);
  });

  // Auto width
  sheet.columns.forEach((column) => {
    let maxLength = 15;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length + 2);
    });
    column.width = Math.min(maxLength, 30);
  });

  await workbook.xlsx.writeFile(filepath);
}

module.exports = {
  // ============================
  // 📌 1. LISTAR REPORTES
  // ============================
  async listar(req, res) {
    try {
      const { tipo, formato, fecha } = req.query;

      const where = {};
      if (tipo) where.tipo = tipo;
      if (formato) where.formato = formato;
      if (fecha) {
        where.fecha_generacion = {
          [Op.gte]: new Date(`${fecha}T00:00:00`),
          [Op.lte]: new Date(`${fecha}T23:59:59`),
        };
      }

      const data = await Reporte.findAll({
        where,
        include: [{ model: Usuario, attributes: ["nombre", "email"] }],
        order: [["fecha_generacion", "DESC"]],
      });

      res.json(data);
    } catch (e) {
      console.error("❌ Error listando reportes:", e);
      res.status(500).json({ error: "Error al listar reportes" });
    }
  },

  // ============================
  // 📌 2. GENERAR REPORTE
  // ============================
  async generar(req, res) {
    try {
      const { tipo, formato, periodo } = req.body;
      const id_usuario = req.user.id_usuario;

      const folder = path.join(__dirname, "../../reportes");
      if (!fs.existsSync(folder)) fs.mkdirSync(folder);

      const ext = formato === "PDF" ? "pdf" : "xlsx";
      const filename = `reporte_${Date.now()}.${ext}`;
      const filepath = path.join(folder, filename);

      let data = [];
      const filtroPeriodo = obtenerRangoPeriodo(periodo);

      if (tipo === "Inventario General") {
        data = await Producto.findAll({
          include: [{ model: Categoria, as: "Categoria", attributes: ["nombre"], required: false }],
          order: [["id_producto", "ASC"]],
        });
      } else if (tipo === "Movimientos") {
        data = await Movimiento.findAll({
          where: filtroPeriodo ? { fecha: filtroPeriodo } : {},
          include: [
            { model: Producto, attributes: ["nombre"], required: false },
            { model: Usuario, attributes: ["nombre"], required: false },
          ],
          order: [["fecha", "DESC"]],
        });
      } else if (tipo === "Stock Bajo") {
        data = await Producto.findAll({
          where: { stock_actual: { [Op.lte]: 10 } },
          include: [{ model: Categoria, as: "Categoria", attributes: ["nombre"], required: false }],
          order: [["stock_actual", "ASC"]],
        });
      } else {
        return res.status(400).json({ error: "Tipo de reporte no soportado" });
      }

      if (!data.length) {
        return res.status(400).json({ error: "No hay datos para generar este reporte" });
      }

      const { headers, rows } = obtenerConfigReporte(tipo, data);

      if (formato === "PDF") {
        await generarPDF(filepath, tipo, headers, rows);
      } else {
        await generarExcel(filepath, tipo, headers, rows);
      }

      const nuevo = await Reporte.create({
        id_usuario,
        tipo,
        formato,
        ruta_archivo: filename,
      });

      await registrarAccion(id_usuario, "CREAR", `Generó reporte ${tipo}`);

      res.status(201).json({
        message: "Reporte generado",
        id_reporte: nuevo.id_reporte,
        archivo: filename,
      });
    } catch (e) {
      console.error("❌ Error generando reporte:", e);
      res.status(500).json({ error: "Error al generar reporte" });
    }
  },

  // ============================
  // 📌 3. DESCARGAR REPORTE
  // ============================
  async descargar(req, res) {
    try {
      const { id } = req.params;

      const rep = await Reporte.findByPk(id);
      if (!rep) return res.status(404).json({ error: "Reporte no encontrado" });

      const file = path.join(__dirname, "../../reportes", rep.ruta_archivo);

      if (!fs.existsSync(file)) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }

      res.download(file);
    } catch (e) {
      console.error("❌ Error descargando reporte:", e);
      res.status(500).json({ error: "Error al descargar reporte" });
    }
  },
};