import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDown } from "lucide-react";
import ProfileModal from "../components/ProfileModal";
import { useNavigate } from "react-router-dom";

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

  return (
    <>
      <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">

        <input
          placeholder="Buscar productos..."
          className="w-1/2 bg-gray-100 rounded-xl px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
        />

        <div className="flex items-center gap-6">

          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow">
                {initials}
              </div>
              <ChevronDown size={18} className={`text-gray-600 transition ${openMenu ? "rotate-180" : ""}`} />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-200 p-2 animate-fadeIn">
                <p className="px-3 py-2 text-xs text-gray-500">{user?.email}</p>

                <button
                  onClick={() => {
                    setOpenProfile(true);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                >
                  👤 Perfil
                </button>

                {/* SOLO ADMIN */}
                {hasRole("Administrador") && (
                  <button
                    onClick={() => {
                      navigate("/configuracion");
                      setOpenMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    ⚙ Configuración
                  </button>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-500 mt-1"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} user={user} />
    </>
  );
}
