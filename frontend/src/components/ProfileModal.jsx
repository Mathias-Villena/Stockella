import React from "react";
import { Mail, User, Shield, X } from "lucide-react";

export default function ProfileModal({ open, onClose, user }) {
  if (!open) return null;

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((p) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-[420px] rounded-3xl border border-slate-100 shadow-2xl p-6 relative animate-modalUp">
        
        {/* BOTÓN CERRAR */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50 mt-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-blue-500/10 mb-3.5">
            {initials}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{user?.nombre}</h2>
          <span className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <Shield size={12} /> {user?.rol || "Usuario"}
          </span>
        </div>

        {/* INFO */}
        <div className="pt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Información del Perfil
          </h3>

          <div className="space-y-3">
            {/* EMAIL */}
            <div className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
              </div>
            </div>

            {/* CARGO */}
            <div className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo / Rol</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.rol || "Sin rol asignado"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex mt-6 pt-4 border-t border-slate-50">
          <button
            onClick={onClose}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition text-center"
          >
            Cerrar Perfil
          </button>
        </div>

      </div>
    </div>
  );
}
