const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// ROLES
const Rol = sequelize.define('Rol', {
  id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT }
}, { tableName: 'roles', timestamps: false });

// USUARIOS
const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  id_rol: { type: DataTypes.INTEGER, allowNull: false },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'usuarios', timestamps: false });

// CATEGORIAS
const Categoria = sequelize.define('Categoria', {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT }
}, { tableName: 'categorias', timestamps: false });

// PRODUCTOS
const Producto = sequelize.define('Producto', {
  id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  precio: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  stock_actual: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  unidad_medida: { type: DataTypes.STRING(20) },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_registro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  id_categoria: { type: DataTypes.INTEGER }
}, { tableName: 'productos', timestamps: false });

// IMAGENES PRODUCTO
const ImagenProducto = sequelize.define('ImagenProducto', {
  id_imagen: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING(255), allowNull: false },
  es_principal: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'imagenes_producto', timestamps: false });

// MOVIMIENTOS
const Movimiento = sequelize.define('Movimiento', {
  id_movimiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  motivo: { type: DataTypes.STRING(100) },
  evidencia_url: { type: DataTypes.STRING(255) },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'movimientos', timestamps: false });

// ALERTAS
const Alerta = sequelize.define('Alerta', {
  id_alerta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_producto: { type: DataTypes.INTEGER },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  mensaje: { type: DataTypes.TEXT },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  atendida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'alertas', timestamps: false });

// DATASET ML
const DatasetML = sequelize.define('DatasetML', {
  id_dataset: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_producto: { type: DataTypes.INTEGER },
  imagen_url: { type: DataTypes.STRING(255), allowNull: false },
  etiqueta: { type: DataTypes.STRING(100), allowNull: false },
  fuente: { type: DataTypes.STRING(50), allowNull: false },
  fecha_subida: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'dataset_ml', timestamps: false });

// VERSION MODELO
const VersionModelo = sequelize.define('VersionModelo', {
  id_modelo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_modelo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  precision: { type: DataTypes.DECIMAL(5,2) },
  fecha_entrenamiento: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'En Prueba' }
}, { tableName: 'version_modelo', timestamps: false });

// REPORTES
const Reporte = sequelize.define('Reporte', {
  id_reporte: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  formato: { type: DataTypes.STRING(10), allowNull: false },
  ruta_archivo: { type: DataTypes.STRING(255) },
  fecha_generacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'reportes', timestamps: false });

// AUDITORIA
const Auditoria = sequelize.define('Auditoria', {
  id_auditoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER },
  accion: { type: DataTypes.STRING(100), allowNull: false },
  detalle: { type: DataTypes.TEXT },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'auditoria', timestamps: false });

// CONFIGURACIONES
const Configuracion = sequelize.define('Configuracion', {
  id_config: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clave: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  valor: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'configuraciones', timestamps: false });

/* ASOCIACIONES */
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });

Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });
Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });

ImagenProducto.belongsTo(Producto, { foreignKey: 'id_producto' });
Producto.hasMany(ImagenProducto, { foreignKey: 'id_producto' });

Movimiento.belongsTo(Producto, { foreignKey: 'id_producto' });
Movimiento.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Producto.hasMany(Movimiento, { foreignKey: 'id_producto' });
Usuario.hasMany(Movimiento, { foreignKey: 'id_usuario' });

Alerta.belongsTo(Producto, { foreignKey: 'id_producto' });
Producto.hasMany(Alerta, { foreignKey: 'id_producto' });

DatasetML.belongsTo(Producto, { foreignKey: 'id_producto' });
Producto.hasMany(DatasetML, { foreignKey: 'id_producto' });

Reporte.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Reporte, { foreignKey: 'id_usuario' });

Auditoria.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Usuario.hasMany(Auditoria, { foreignKey: 'id_usuario' });

module.exports = {
  sequelize,
  Rol, Usuario, Categoria, Producto, ImagenProducto,
  Movimiento, Alerta, DatasetML, VersionModelo,
  Reporte, Auditoria, Configuracion
};
