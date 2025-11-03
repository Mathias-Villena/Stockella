import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login(){
  const { register, handleSubmit } = useForm();
  const { isAuth, login } = useAuth();

  if (isAuth) return <Navigate to="/" replace/>;

  const onSubmit = async (v) => {
    try {
      await login(v.email, v.password);
    } catch  {
      Swal.fire("Error", "Credenciales inválidas", "error");
    }
  };

  return (
    <div className="grid place-content-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="bg-white w-[520px] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,.06)] p-10">
        <div className="grid place-items-center mb-4">
          <div className="h-12 w-12 rounded-2xl bg-[#1B59F8] text-white grid place-content-center">□</div>
          <h1 className="text-2xl font-semibold mt-3">Stockella</h1>
          <p className="text-gray-500 -mt-1">Gestión Inteligente de Inventario</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input className="bg-gray-100 px-4 py-3 rounded-xl" placeholder="Email" {...register("email",{required:true})}/>
          <input type="password" className="bg-gray-100 px-4 py-3 rounded-xl" placeholder="Contraseña" {...register("password",{required:true})}/>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl">Iniciar Sesión</button>
          <div className="text-xs text-gray-500 bg-emerald-50 p-3 rounded-xl">
            <b>Credenciales:</b> admin@stockella.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
