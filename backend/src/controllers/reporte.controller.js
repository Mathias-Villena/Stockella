const { Reporte, Usuario, Producto, Movimiento } = require("../models");
const registrarAccion = require("../middlewares/auditoria");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

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
      if (fecha) where.fecha_generacion = { [Op.gte]: fecha };

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

      // Crear carpeta si no existe
      const folder = path.join(__dirname, "../../reportes");
      if (!fs.existsSync(folder)) fs.mkdirSync(folder);

      const filename = `reporte_${Date.now()}.${formato === "PDF" ? "pdf" : "xlsx"}`;
      const filepath = path.join(folder, filename);

      // Selección de datos
      let data = [];

      if (tipo === "Inventario General") {
        data = await Producto.findAll();
      } 
      else if (tipo === "Movimientos") {
        data = await Movimiento.findAll({ include: Producto });
      }
      else if (tipo === "Stock Bajo") {
        data = await Producto.findAll({ 
          where: { stock_actual: { [Op.lte]: 10 } }
        });
      }
      // Aquí puedes agregar más reportes...

      // EVITAR ERROR SI NO HAY DATOS
      if (data.length === 0) {
        return res.status(400).json({ error: "No hay datos para generar este reporte" });
      }

      // =============== PDF =================
if (formato === "PDF") {
    const PDFDocument = require("pdfkit");
    const PdfTable = require("pdfkit-table");

    const doc = new PDFDocument({
        margin: 40,
        size: "A4"
    });

    doc.pipe(fs.createWriteStream(filepath));

    /** -------------------- HEADER -------------------- **/
    doc
      .fontSize(26)
      .fillColor("#1A56DB")
      .text("STOCKELLA", { align: "left" });

    doc.moveDown(1);

    doc
      .fontSize(20)
      .fillColor("black")
      .text(`Reporte: ${tipo}`, { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("#555")
      .text(
        `Generado el: ${new Date().toLocaleString("es-PE", {
          dateStyle: "long",
          timeStyle: "short",
        })}`,
        { align: "center" }
      );

    doc.moveDown(2);


    /** -------------------- FORMATEAR DATA -------------------- **/

    // Filtramos SOLO los campos que quieres
    const rows = data.map((item) => {
        const o = item.toJSON();

        return [
            o.tipo || "",
            o.cantidad || "",
            o.motivo || "",
            new Date(o.fecha).toLocaleString("es-PE") || "",
            (item.Usuario?.nombre || "Sin nombre")
        ];
    });

    const table = {
        title: "",
        headers: [
            { label: "Tipo", width: 80 },
            { label: "Cantidad", width: 80 },
            { label: "Motivo", width: 180 },
            { label: "Fecha", width: 120 },
            { label: "Usuario", width: 120 },
        ],
        rows,
    };

    /** -------------------- TABLA PROFESIONAL -------------------- **/
    await doc.table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
        divider: {
            header: { width: 1, opacity: 0.7 },
            horizontal: { width: 0.5, opacity: 0.3 }
        },
        padding: 5,
        columnSpacing: 5,
        width: 520
    });


    /** -------------------- FOOTER -------------------- **/
    doc.moveDown(1);
    doc
      .fontSize(10)
      .fillColor("#6B7280")
      .text("Generado por Stockella – Gestión Inteligente", {
        align: "center",
      });

    doc.end();
}


      // =============== EXCEL ===============
      else {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Reporte");

        sheet.addRow(Object.keys(data[0].toJSON()));

        data.forEach((item) => {
          sheet.addRow(Object.values(item.toJSON()));
        });

        await workbook.xlsx.writeFile(filepath);
      }

      // Guardar en BD
      const nuevo = await Reporte.create({
        id_usuario,
        tipo,
        formato,
        ruta_archivo: filename,
      });

      // Registrar auditoría
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

      res.download(file);
    } catch (e) {
      console.error("❌ Error descargando reporte:", e);
      res.status(500).json({ error: "Error al descargar reporte" });
    }
  },
};
