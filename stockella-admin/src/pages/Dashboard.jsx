import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // 🪄 Animaciones
import api from "../services/api";
import CardMetric from "../ui/CardMetric";

export default function Dashboard() {
  const [data, setData] = useState({
    productos: 0,
    usuarios: 0,
    alertas: 0,
    movimientosHoy: 0,
  });

  useEffect(() => {
    api.get("/dashboard/resumen").then((r) => setData(r.data));
  }, []);

  return (
    <motion.div
      className="p-2 md:p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🔹 Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-extrabold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Resumen general del inventario y actividades recientes
        </p>
      </motion.div>

      {/* 🔹 Métricas principales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardMetric
          icon="📦"
          title="Productos en Stock"
          value={data.productos}
        />
        <CardMetric
          icon="⚠️"
          title="Alertas de Bajo Stock"
          value={data.alertas}
          barClass="bg-orange-500"
        />
        <CardMetric
          icon="💹"
          title="Movimientos del Día"
          value={data.movimientosHoy}
          barClass="bg-emerald-500"
        />
      </motion.div>

      {/* 🔹 Sección de accesos rápidos */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-5">
          <h2 className="font-semibold mb-2">Gestión de Productos</h2>
          <p className="text-gray-500 text-sm mb-4">
            Administra el inventario, agrega nuevos productos y actualiza el
            stock disponible.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-[#1B59F8] hover:bg-[#174bd3] text-white px-5 py-3 rounded-xl transition-all duration-300"
          >
            Ir a Productos
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-5">
          <h2 className="font-semibold mb-2">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm mb-4">
            Controla los usuarios del sistema, roles y permisos de acceso.
          </p>
          <Link
            to="/usuarios"
            className="inline-block bg-[#1B59F8] hover:bg-[#174bd3] text-white px-5 py-3 rounded-xl transition-all duration-300"
          >
            Ir a Usuarios
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
