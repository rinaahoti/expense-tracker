import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@demo.com");
  const [password, setPassword] = useState("demo1234");

  const onSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("accessToken", "demo-access");
    localStorage.setItem("refreshToken", "demo-refresh");
    navigate("/", { replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-slate-400">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
          type="email"
          required
        />
      </div>
      <div>
        <label className="text-xs text-slate-400">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
          type="password"
          required
        />
      </div>
      <button className="w-full rounded-xl border border-slate-700 bg-slate-100 text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-white">
        Login
      </button>
      <p className="text-xs text-slate-400">(Demo) Kyçja ruan token në localStorage.</p>
    </form>
  );
}
