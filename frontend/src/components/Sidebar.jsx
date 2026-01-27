import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border border-transparent";
const linkActive = "bg-slate-900/60 border-slate-800";
const linkIdle = "text-slate-300 hover:bg-slate-900/40 hover:border-slate-800";

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:block border-r border-slate-900/80 bg-slate-950">
      <div className="p-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-lg font-semibold">Expense Tracker</div>
          <div className="text-xs text-slate-400 mt-1">Dashboard</div>
        </div>

        <nav className="mt-6 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            <span>📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            <span>🧾</span>
            <span>Transactions</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            <span>🏷️</span>
            <span>Categories</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
