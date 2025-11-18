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
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen">
        
        {/* Topbar con función para abrir modal */}
        <Topbar abrirPerfil={() => setOpenProfile(true)} />

        <div className="p-6">
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

