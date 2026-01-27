import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-6 shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Expense Tracker</h1>
          <p className="text-sm text-slate-400">Kyçu për me vazhdu</p>
        </div>
        <Outlet />
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <Link className="hover:text-slate-200" to="/login">
            Login
          </Link>
          <Link className="hover:text-slate-200" to="/register">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
