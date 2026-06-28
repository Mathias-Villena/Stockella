import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState } from "react";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const [openProfile, setOpenProfile] = useState(false);
  const { user } = useAuth(); // ya tienes al usuario acá

  return (
    <div className="flex bg-[#F8FAFC] h-screen overflow-hidden relative">
      {/* Resplandores de fondo mesh gradients premium */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none z-0" />

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        {/* Topbar con función para abrir modal */}
        <Topbar abrirPerfil={() => setOpenProfile(true)} />

        <div className="p-6 flex-1 overflow-y-auto custom-scroll">
          <Outlet />
        </div>
      </main>

      {/* Modal del Perfil */}
      <ProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        user={user}
      />
    </div>
  );
}

