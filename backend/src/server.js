require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT,'0.0.0.0', () =>
      console.log(`🚀 API escuchando en http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ Error de conexión DB:", e.message);
    process.exit(1);
  }
};

start();
