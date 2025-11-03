import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("stk_user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("stk_token"));
  const [loading, setLoading] = useState(false);

  // 🔄 Verificar sesión almacenada
  useEffect(() => {
    if (token) api.defaults.headers.Authorization = `Bearer ${token}`;
  }, [token]);

  // 🔑 Iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("stk_token", data.token);
      localStorage.setItem("stk_user", JSON.stringify(data.usuario));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setUser(data.usuario);
      setToken(data.token);
    } catch (e) {
      console.error("❌ Error de login:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Cerrar sesión
  const logout = () => {
    localStorage.removeItem("stk_token");
    localStorage.removeItem("stk_user");
    setUser(null);
    setToken(null);
    delete api.defaults.headers.Authorization;
  };

  // 🧩 Verificar permisos según rol
  const hasRole = (...rolesPermitidos) => {
    if (!user) return false;
    return rolesPermitidos.includes(user.rol);
  };

  // 🧱 Contexto compartido
  return (
    <AuthCtx.Provider
      value={{
        user,
        token,
        isAuth: !!user,
        loading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
