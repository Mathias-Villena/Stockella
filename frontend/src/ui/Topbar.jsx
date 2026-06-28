import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDown, Search, User, Settings, LogOut } from "lucide-react";
import ProfileModal from "../components/ProfileModal";
import { useNavigate } from "react-router-dom";
import { playClick } from "../utils/sound";

export default function Topbar() {
  const { user, logout, hasRole } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-40">
        
        {/* BUSCADOR */}
        <div className="relative w-96 max-w-full">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            placeholder="Buscar productos..."
            className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700"
          />
        </div>

        {/* CONTROLES */}
        <div className="flex items-center gap-6">
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => {
                playClick();
                setOpenMenu(!openMenu);
              }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/10">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.nombre}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{user?.rol}</p>
              </div>
              <ChevronDown size={15} className={`text-slate-500 transition duration-200 ${openMenu ? "rotate-180" : ""}`} />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-2xl border border-slate-100 p-2 animate-fadeIn z-50">
                <div className="px-3 py-2 border-b border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuario activo</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="p-1 space-y-0.5 animate-fadeIn">
                  <button
                    onClick={() => {
                      playClick();
                      setOpenProfile(true);
                      setOpenMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-sm transition font-semibold cursor-pointer"
                  >
                    <User size={16} className="text-slate-400" />
                    Mi Perfil
                  </button>

                  {/* SOLO ADMIN */}
                  {hasRole("Administrador") && (
                    <button
                      onClick={() => {
                        playClick();
                        navigate("/configuracion");
                        setOpenMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-sm transition font-semibold cursor-pointer"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Configuración
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      playClick();
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 text-sm transition font-bold cursor-pointer"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} user={user} />
    </>
  );
}

