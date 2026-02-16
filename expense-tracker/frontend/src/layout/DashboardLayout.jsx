import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((open) => !open);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="flex-1 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeMobileSidebar}
          />
          <div className="w-72 bg-white shadow-2xl border-l border-slate-200 slide-up">
            <Sidebar onNavigate={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar onToggleSidebar={toggleMobileSidebar} />
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




