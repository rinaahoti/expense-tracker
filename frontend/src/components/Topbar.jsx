import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api.js";

export default function Topbar() {
  const navigate = useNavigate();

  const logout = () => {
    authAPI.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-900/80 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="md:hidden text-sm font-semibold">Expense Tracker</div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={logout}
            className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900/70"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
