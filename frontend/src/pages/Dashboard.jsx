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
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Last updated: {new Date().toLocaleDateString()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats-card income">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Total Income</div>
                  <div className="text-2xl font-bold text-slate-900">€{stats.income.toFixed(2)}</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="stats-card expense">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Total Expenses</div>
                  <div className="text-2xl font-bold text-slate-900">€{stats.expense.toFixed(2)}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`stats-card ${stats.balance >= 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50' : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200/50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Net Balance</div>
                  <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{stats.balance.toFixed(2)}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <svg className={`w-6 h-6 ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.balance >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Transactions</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.transactionCount}</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                View All →
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 mb-4">No transactions yet</p>
                <button className="btn-primary">
                  Add Your First Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={transaction.type === 'income'
                              ? "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                              : "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            }
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {transaction.description || `${transaction.type} transaction`}
                        </div>
                        <div className="text-sm text-slate-500">
                          {transaction.category_name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}€{parseFloat(transaction.amount).toFixed(2)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        transaction.type === 'income' ? 'badge-income' : 'badge-expense'
                      }`}>
                        {transaction.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
