import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import CardMetric from "../ui/CardMetric";

/* 📊 Recharts */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({
    cards: {
      productos: 0,
      usuarios: 0,
      alertas: 0,
      movimientosHoy: 0,
    },
    stockPorCategoria: [],
    estadoAlertas: {},
    movimientosSemana: {
      dias: [],
      entradas: [],
      salidas: [],
    },
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
          value={data.cards.productos}
        />
        <CardMetric
          icon="⚠️"
          title="Alertas de Bajo Stock"
          value={data.cards.alertas}
          barClass="bg-orange-500"
        />
        <CardMetric
          icon="💹"
          title="Movimientos del Día"
          value={data.cards.movimientosHoy}
          barClass="bg-emerald-500"
        />
      </motion.div>

      {/* 📊 Stock por Categoría */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Stock por Categoría</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.stockPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 Estado de Alertas */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Estado de Alertas</h2>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={[
                {
                  name: "Stock Bajo",
                  value: data.estadoAlertas.stock_bajo,
                  fill: "#F59E0B",
                },
                {
                  name: "Agotados",
                  value: data.estadoAlertas.agotados,
                  fill: "#EF4444",
                },
                {
                  name: "OK",
                  value: data.estadoAlertas.ok,
                  fill: "#10B981",
                },
              ]}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Movimientos de la Semana */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Movimientos de la Semana</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={
              data.movimientosSemana?.dias?.map((d, i) => ({
                dia: d,
                entradas: data.movimientosSemana.entradas[i],
                salidas: data.movimientosSemana.salidas[i],
              })) || []
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="entradas"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="salidas"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Accesos rápidos */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-5">
          <h2 className="font-semibold mb-2">Gestión de Productos</h2>
          <p className="text-gray-500 text-sm mb-4">
            Administra los productos, stock y categorías.
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
            Controla los usuarios del sistema, roles y permisos.
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
