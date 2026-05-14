import { Link, useLocation } from "react-router-dom";

function Item({ to, label, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50
        ${active ? "bg-blue-50 text-[#174bd3] font-semibold" : "text-gray-700"}`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen p-4 shadow-[0_8px_24px_rgba(0,0,0,.06)] sticky top-0">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#1B59F8] grid place-content-center text-white font-bold">
          □
        </div>
        <div>
          <p className="font-bold">Stockella</p>
          <p className="text-xs text-gray-500 -mt-1">Gestión Inteligente</p>
        </div>
      </div>

      {/* MENÚ */}
      <nav className="flex flex-col gap-1">
        <Item to="/" label="Dashboard" icon="📊" />
        <Item to="/productos" label="Productos" icon="📦" />
        <Item to="/categorias" label="Categorías" icon="🏷️" />
        <Item to="/usuarios" label="Usuarios" icon="👥" />
        <Item to="/movimientos" label="Movimientos" icon="💼" />
        <Item to="/alertas" label="Alertas" icon="⚠️" />
        <Item to="/dataset" label="Dataset ML" icon="🧠" />

        {/* 🔥 NUEVO */}
        <Item to="/auditoria" label="Auditoría" icon="📝" />
        <Item to="/reportes" label="Reportes" icon="📑" />
        <Item to="/configuracion" label="Configuración" icon="⚙️" />
      </nav>
    </aside>
  );
}
