import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import logo from "../assets/stockella-logo.jpeg";
import imagenProducto from "../assets/imagenproducto.png";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { isAuth, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  if (isAuth) return <Navigate to="/" replace />;

  const onSubmit = async (v) => {
    try {
      await login(v.email, v.password);
    } catch {
      Swal.fire("Error", "Credenciales inválidas", "error");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100 overflow-hidden">
      {/* IZQUIERDA */}
      <section className="relative hidden lg:flex flex-col items-center justify-center bg-[#061B35] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-5xl font-black leading-tight max-w-[560px] mb-16"
        >
          Control inteligente <br />
          de inventario con IA.
        </motion.h1>

        <div className="relative z-10 w-[520px] h-[380px]">
          <FloatCard
            className="left-8 top-0 rotate-[-7deg]"
            title="Inventario"
            value="1.250"
            subtitle="Productos"
            color="from-sky-400 to-blue-500"
          />

          <FloatCard
            className="right-8 top-2 rotate-[8deg]"
            title="Alertas"
            value="15"
            subtitle="Activas"
            color="from-orange-400 to-red-500"
          />

          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="absolute left-1/2 top-40 -translate-x-1/2 w-[250px] rounded-[28px] border border-white/20 bg-white/15 backdrop-blur-xl p-5 shadow-2xl"
          >
            <p className="text-sm font-semibold text-cyan-100 mb-3">
              Reconocimiento IA
            </p>

            <div className="h-28 rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-600 p-[2px] overflow-hidden">
              <div className="h-full w-full rounded-[1.25rem] overflow-hidden bg-transparent">
                <img
                  src={imagenProducto}
                  alt="Producto detectado"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-blue-50">
              Detectado: Producto
            </p>
            <p className="text-sm font-bold">Confianza 98%</p>
          </motion.div>
        </div>
      </section>

      {/* DERECHA */}
      <section className="flex items-center justify-center bg-[#F4F7FB] p-8">
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-[430px]"
        >
          <div className="flex justify-center mb-7">
            <img src={logo} alt="Stockella" className="h-38 object-contain" />
          </div>

          <h2 className="text-center text-4xl font-black text-slate-900 leading-tight">
            Bienvenido <br /> de nuevo
          </h2>

          <p className="text-center text-slate-500 mt-3 mb-9">
            Inicia sesión para continuar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Correo electrónico
              </label>
              <input
                className="mt-2 w-full h-12 rounded-lg border border-slate-300 bg-white px-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                placeholder="admin@stockella.com"
                {...register("email", { required: true })}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Contraseña
              </label>

              <div className="mt-2 flex h-12 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500">
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex-1 px-4 outline-none"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-sm text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button className="w-full h-12 rounded-lg bg-[#1B8EF8] hover:bg-[#0F7DE0] text-white font-bold shadow-lg shadow-blue-500/25 active:scale-[.98] transition">
              Iniciar Sesión
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

function FloatCard({ className, title, value, subtitle, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.6 },
        y: { duration: 4, repeat: Infinity },
      }}
      className={`absolute w-[180px] rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl p-5 shadow-2xl ${className}`}
    >
      <p className="text-sm text-blue-100">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
      <p className="text-xs text-blue-100">{subtitle}</p>
      <div className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${color}`} />
    </motion.div>
  );
}