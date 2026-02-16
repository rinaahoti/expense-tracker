import { authAPI } from "../lib/api.js";

export default function Settings() {
  const user = authAPI.getCurrentUser();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Personalize your expense tracker experience.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
              {(user?.username || user?.email || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {user?.username || "User"}
              </div>
              <div className="text-xs text-slate-500">
                {user?.email || "No email available"}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Appearance
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Light, modern UI optimized for readability.
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                Light mode
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Currency
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  All amounts are currently displayed in Euro.
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                EUR €
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Data & Privacy
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Your data is stored securely in your own database.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

