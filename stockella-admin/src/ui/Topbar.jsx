import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)] px-6 flex items-center justify-between">
      <input placeholder="Buscar productos..." className="w-1/2 bg-gray-100 rounded-xl px-4 py-2 outline-none" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button onClick={logout} className="text-red-500 text-sm font-semibold">Cerrar Sesión</button>
      </div>
    </header>
  );
}
