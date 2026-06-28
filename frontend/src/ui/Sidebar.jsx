import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { playClick } from "../utils/sound";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ArrowUpDown,
  AlertTriangle,
  Cpu,
  FileText,
  FileBarChart2,
  Settings,
} from "lucide-react";

function Item({ to, label, icon: Icon }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={playClick}
      className="block"
    >
      <motion.div
        className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
          ${
            active
              ? "bg-blue-600/10 text-blue-400 font-bold border-l-4 border-l-blue-500 shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] shadow-blue-500/5"
              : "text-slate-400 hover:bg-slate-700/40 hover:text-slate-100"
          }`}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon
          size={19}
          className={`transition-all duration-200 ${
            active ? "text-blue-400 scale-105" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-105"
          }`}
        />
        <span className="text-sm tracking-wide">{label}</span>
      </motion.div>
    </Link>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";

  return (
    <aside className="w-64 bg-[#1e293b] h-screen p-5 border-r border-slate-700/50 flex flex-col justify-between sticky top-0 z-40 text-slate-300">
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Package size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-lg tracking-tight leading-none">Stockella</h2>
            <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-950/80 border border-blue-800/40 px-1.5 py-0.5 rounded-md mt-1 inline-block">
              Inteligente
            </span>
          </div>
        </div>

        {/* MENÚ */}
        <nav className="flex flex-col gap-1 overflow-y-auto pr-1 -mr-2 custom-scroll max-h-[calc(100vh-190px)]">
          <Item to="/" label="Dashboard" icon={LayoutDashboard} />
          <Item to="/productos" label="Productos" icon={Package} />
          <Item to="/categorias" label="Categorías" icon={Tag} />
          <Item to="/usuarios" label="Usuarios" icon={Users} />
          <Item to="/movimientos" label="Movimientos" icon={ArrowUpDown} />
          <Item to="/alertas" label="Alertas" icon={AlertTriangle} />
          <Item to="/dataset" label="Dataset ML" icon={Cpu} />

          <div className="my-2 border-t border-slate-700/50" />

          <Item to="/auditoria" label="Auditoría" icon={FileText} />
          <Item to="/reportes" label="Reportes" icon={FileBarChart2} />
          <Item to="/configuracion" label="Configuración" icon={Settings} />
        </nav>
      </div>

      {/* DETALLES DE USUARIO */}
      {user && (
        <div className="border-t border-slate-700/50 pt-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate leading-tight">
              {user.nombre}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

