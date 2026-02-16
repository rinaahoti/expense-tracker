import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api.js";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.register({ username, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="text-red-600 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-modern w-full"
          type="text"
          placeholder="Choose a username"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-modern w-full"
          type="email"
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-modern w-full"
          type="password"
          placeholder="Create a password (min 6 characters)"
          required
          minLength="6"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="loading-spinner"></div>
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
