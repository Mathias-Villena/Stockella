import React from "react";
import { Mail, User, Shield } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-[650px] rounded-2xl shadow-xl p-8 relative max-h-[90vh] overflow-y-auto animate-scaleIn">

        {/* BOTÓN CERRAR */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b pb-5">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow">
            {initials}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{user?.nombre}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Shield size={14} /> {user?.rol}
            </p>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-7">
          <h3 className="font-semibold text-lg mb-3">Información de Contacto</h3>

          <div className="grid grid-cols-2 gap-4">
            
            {/* EMAIL */}
            <div className="border p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Mail size={12} />
                Email
              </p>
              <p className="mt-1">{user?.email}</p>
            </div>

            {/* CARGO */}
            <div className="border p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <User size={12} />
                Cargo
              </p>
              <p className="mt-1">{user?.rol}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
