import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@demo.com");
  const [password, setPassword] = useState("demo1234");

  const onSubmit = (e) => {
    e.preventDefault();
    navigate("/login", { replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-slate-400">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
          required
        />
      </div>
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
        Register
      </button>
    </form>
  );
}
