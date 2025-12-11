const swaggerJsDoc = require("swagger-jsdoc");

// 📘 Configuración principal
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "📦 Stockella API",
    version: "1.0.0",
    description: `
### Sistema de Gestión Inteligente de Inventario – *Stockella*

Esta documentación describe los endpoints disponibles para el backend del sistema **Stockella**, 
incluyendo autenticación JWT, subida de imágenes a AWS S3 y control de acceso por roles (RBAC).

#### Roles soportados:
- 🧑‍💼 **Administrador** – Control total (usuarios, productos, alertas, reportes)
- 🧑‍🔧 **Editor** – Puede crear y editar productos, registrar movimientos
- 👀 **Visualizador** – Solo puede consultar datos (sin modificar)
- 👷‍♂️ **Empleado** – Puede registrar movimientos de stock
`,
    contact: {
      name: "Equipo Stockella",
      email: "soporte@stockella.com",
    },
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Servidor local de desarrollo",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// 📂 Configuración de rutas
const options = {
  swaggerDefinition,
  apis: [
    "./src/routes/*.js",         // Rutas principales (productos, usuarios, etc.)
    "./src/routes/**/*.js",      // Si tienes subcarpetas futuras
  ],
};

// 🚀 Exportar configuración lista
module.exports = require("swagger-jsdoc")(options);
