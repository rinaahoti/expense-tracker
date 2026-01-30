import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs text-slate-400">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
          type="email"
          required
          disabled={loading}
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
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl border border-slate-700 bg-slate-100 text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
