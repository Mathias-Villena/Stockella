const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/usuarios", require("./routes/usuario.routes"));
app.use("/api/productos", require("./routes/producto.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/movimientos", require("./routes/movimiento.routes"));
app.use("/api/alertas", require("./routes/alerta.routes"));
app.use("/api/upload", require("./routes/upload.routes"));


// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_, res) => res.send("✅ Stockella API Activa"));

module.exports = app;

