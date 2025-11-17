import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../ui/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Usuarios from "../pages/Usuarios";
import ProtectedRoute from "./ProtectedRoute";
import Alertas from "../pages/Alertas";
import Movimientos from "../pages/Movimientos";
import DatasetML from "../pages/DatasetML";
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "productos", element: <Productos /> },
      { path: "usuarios", element: <Usuarios /> },
      { path: "movimientos", element: <Movimientos /> },
      { path: "alertas", element: <Alertas /> },
      { path: "dataset", element: <DatasetML /> },

    ],
  },
]);
