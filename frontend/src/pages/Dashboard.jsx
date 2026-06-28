import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import CardMetric from "../ui/CardMetric";
import { Package, AlertTriangle, ArrowUpDown, ArrowRight, ShieldCheck, Users } from "lucide-react";

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
  Cell,
} from "recharts";

// Tooltip personalizado premium para los gráficos
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-medium animate-fadeIn">
        {label && <p className="mb-1 text-slate-400 font-bold">{label}</p>}
        {payload.map((item, idx) => (
          <p key={idx} className="flex items-center gap-2 mt-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span>{item.name}:</span>
            <span className="font-extrabold">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState({
    cards: {
      productos: 0,
      usuarios: 0,
      alertas: 0,
      movimientosHoy: 0,
    },
    stockPorCategoria: [],
    estadoAlertas: {
      stock_bajo: 0,
      agotados: 0,
      ok: 0
    },
    movimientosSemana: {
      dias: [],
      entradas: [],
      salidas: [],
    },
  });

  useEffect(() => {
    api.get("/dashboard/resumen").then((r) => setData(r.data));
  }, []);

  // Preparar datos para el Donut de alertas
  const alertasData = [
    { name: "Stock Bajo", value: data.estadoAlertas?.stock_bajo || 0, color: "#F59E0B" },
    { name: "Agotados", value: data.estadoAlertas?.agotados || 0, color: "#EF4444" },
    { name: "Suficiente", value: data.estadoAlertas?.ok || 0, color: "#10B981" },
  ].filter(item => item.value > 0);

  // Fallback si no hay alertas registradas para no renderizar un donut vacío
  const finalAlertasData = alertasData.length > 0 ? alertasData : [{ name: "Sin alertas", value: 1, color: "#E2E8F0" }];

  return (
    <motion.div
      className="p-1 md:p-2 space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 🔹 Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Panel de <span className="premium-gradient-text">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumen en tiempo real del inventario y actividades
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs font-bold text-[#1B59F8] shadow-sm">
          <ShieldCheck size={16} className="animate-pulse" />
          <span>Sistema Conectado</span>
        </div>
      </div>

      {/* 🔹 Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CardMetric
          icon={Package}
          title="Productos en Stock"
          value={data.cards.productos}
          iconClass="bg-blue-50 text-blue-600 border border-blue-100"
          barClass="bg-gradient-to-r from-blue-500 to-indigo-500"
        />
        <CardMetric
          icon={AlertTriangle}
          title="Alertas de Bajo Stock"
          value={data.cards.alertas}
          iconClass="bg-amber-50 text-amber-600 border border-amber-100"
          barClass="bg-gradient-to-r from-amber-500 to-orange-500"
        />
        <CardMetric
          icon={ArrowUpDown}
          title="Movimientos de Hoy"
          value={data.cards.movimientosHoy}
          iconClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
          barClass="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>

      {/* 📊 Sección de Gráficos Duales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock por Categoría */}
        <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 lg:col-span-2 gradient-border-top">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Stock por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.stockPorCategoria}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B59F8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="categoria" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de Alertas */}
        <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gradient-border-top">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Estado de Alertas
            </h3>
            <p className="text-xs text-slate-400 mb-4">Distribución del nivel de stock</p>
          </div>
          <div className="relative flex items-center justify-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalAlertasData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {finalAlertasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-800">{data.cards.alertas}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Alertas</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {alertasData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📈 Movimientos de la Semana */}
      <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 gradient-border-top">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Movimientos de la Semana
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={
              data.movimientosSemana?.dias?.map((d, i) => ({
                dia: d,
                entradas: data.movimientosSemana.entradas[i] || 0,
                salidas: data.movimientosSemana.salidas[i] || 0,
              })) || []
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />

            <Line
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#10B981", strokeWidth: 1, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="salidas"
              name="Salidas"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#EF4444", strokeWidth: 1, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-start gap-4 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#1B59F8] flex items-center justify-center shadow-inner">
            <Package size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm">Gestión de Productos</h4>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Administra los productos del catálogo, actualiza stock mínimo y clasifica por categorías.
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B59F8] hover:text-[#174bd3] mt-3 group"
            >
              <span>Ir a Productos</span>
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-start gap-4 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm">Gestión de Usuarios</h4>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Controla los accesos de operarios, asigna roles de editor o visualizador y audita su actividad.
            </p>
            <Link
              to="/usuarios"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-3 group"
            >
              <span>Ir a Usuarios</span>
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

