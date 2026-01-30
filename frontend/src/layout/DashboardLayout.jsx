import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="fade-in">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}




