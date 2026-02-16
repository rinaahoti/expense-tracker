import { useState, useEffect } from "react";
import { transactionsAPI, categoriesAPI } from "../lib/api.js";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    transactionCount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        transactionsAPI.getAll({ limit: 10, sort_by: 'created_at', sort_order: 'desc' }),
        categoriesAPI.getAll()
      ]);

      const transactions = transactionsData.transactions || [];
      setTransactions(transactions);
      setCategories(categoriesData);

      // Calculate statistics
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      setStats({
        income,
        expense,
        balance: income - expense,
        transactionCount: transactions.length
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="uppercase tracking-[0.25em] text-[11px] text-slate-700 mb-1">
            Elite Expense Studio
          </p>
          <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900">
            Your Wealth Command Center
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor cash flow, track spending, and keep your lifestyle in perfect balance.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 bg-white/70 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-white/60">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="10" />
            </svg>
            <span className="font-medium text-slate-700">Portfolio synced</span>
          </div>
          <span className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Updated {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-slate-600">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="stats-card income relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Monthly inflow
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    €{stats.income.toFixed(2)}
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700/80 uppercase tracking-[0.2em]">
                    Total income
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="stats-card expense relative overflow-hidden">
              <div className="absolute -right-6 -bottom-10 w-24 h-24 rounded-full bg-rose-300/30 blur-2xl" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-rose-700 mb-1 flex items-center gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Lifestyle spending
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    €{stats.expense.toFixed(2)}
                  </div>
                  <p className="mt-1 text-[11px] text-rose-700/80 uppercase tracking-[0.2em]">
                    Total expenses
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`stats-card relative overflow-hidden ${stats.balance >= 0 ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 border-slate-700/80' : 'bg-gradient-to-br from-rose-900 via-rose-900 to-rose-800 text-rose-50 border-rose-700/80'}`}>
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_#eab308_0,_transparent_55%),radial-gradient(circle_at_bottom,_#38bdf8_0,_transparent_55%)]" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5 uppercase tracking-[0.25em]">
                    Net Worth Pulse
                  </div>
                  <div className="text-2xl font-semibold">
                    €{stats.balance.toFixed(2)}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300/90">
                    {stats.balance >= 0
                      ? "You are building wealth this period."
                      : "Your expenses are outpacing income this period."}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.balance >= 0 ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
                  <svg className={`w-6 h-6 ${stats.balance >= 0 ? 'text-emerald-300' : 'text-rose-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.balance >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                </div>
              </div>
            </div>

            <div className="stats-card relative overflow-hidden">
              <div className="absolute -left-10 -top-10 w-24 h-24 rounded-full bg-blue-400/20 blur-2xl" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Transactions this period</div>
                  <div className="text-2xl font-semibold text-slate-900">{stats.transactionCount}</div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Active money movements tracked across all categories.
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lower grid: recent transactions + spending overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                  <p className="text-xs text-slate-500 mt-1">A snapshot of your latest money movements.</p>
                </div>
                <button className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full transition-colors duration-200">
                  View full history
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-900/90 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">No transactions yet</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Start by adding your first income or expense to see insights here.
                  </p>
                  <button className="btn-primary text-sm px-5 py-2.5">
                    Add your first transaction
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-white transition-colors duration-200 border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                            transaction.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                transaction.type === 'income'
                                  ? 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'
                                  : 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                              }
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {transaction.description || `${transaction.type} transaction`}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{transaction.category_name || 'Uncategorized'}</span>
                            <span className="h-3 w-px bg-slate-200" />
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          €{parseFloat(transaction.amount).toFixed(2)}
                        </div>
                        <div
                          className={`mt-1 text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                            transaction.type === 'income' ? 'badge-income' : 'badge-expense'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              transaction.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="uppercase tracking-[0.18em]">
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simple spending overview (placeholder, front-only) */}
            <div className="card p-6 lg:col-span-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Spending snapshot</h2>
              <p className="text-xs text-slate-500 mb-4">
                High-level view of how your money is allocated.
              </p>

              <div className="relative mb-5">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-2/5 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-indigo-500 inline-block" />
                  <div className="h-full w-1/4 bg-gradient-to-r from-amber-400 to-amber-500 inline-block" />
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-800">Essentials</span>
                  </div>
                  <span className="text-slate-500">~40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="font-medium text-slate-800">Lifestyle & experiences</span>
                  </div>
                  <span className="text-slate-500">~35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-medium text-slate-800">Savings & investments</span>
                  </div>
                  <span className="text-slate-500">~25%</span>
                </div>
              </div>

              <p className="mt-5 text-[11px] text-slate-400">
                Detailed analytics can be refined once you have more categorized transactions.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
