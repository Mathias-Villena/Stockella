import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout(){
  return (
    <div className="flex">
      <Sidebar/>
      <main className="flex-1 min-h-screen">
        <Topbar/>
        <div className="p-6">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
