import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-32 -left-10 w-72 h-72 bg-gradient-to-br from-black via-slate-900 to-black rounded-full mix-blend-screen blur-3xl"></div>
        <div className="absolute -top-16 right-0 w-64 h-64 bg-gradient-to-br from-black via-slate-800 to-slate-900 rounded-full mix-blend-screen blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-gradient-to-tr from-slate-800 via-black to-transparent rounded-full mix-blend-screen blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="form-container">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-black rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-2xl border border-slate-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.8),_transparent_60%)]" />
              <span className="relative text-2xl font-semibold tracking-wide text-slate-100">
                ET
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white mb-1 tracking-wide">
              Elite Expense Studio
            </h1>
            <p className="text-slate-300 text-sm">
              A luxury-grade dashboard to curate your financial lifestyle.
            </p>
          </div>

          <div className="fade-in">
            <Outlet />
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
            <Link className="hover:text-blue-600 transition-colors duration-200 font-medium" to="/login">
              Sign In
            </Link>
            <Link className="hover:text-blue-600 transition-colors duration-200 font-medium" to="/register">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
