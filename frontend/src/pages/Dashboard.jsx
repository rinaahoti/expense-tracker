import { useState, useEffect } from "react";
import { loadTransactions, loadCategories } from "../utils/storage.js";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [latestTransactions, setLatestTransactions] = useState([]);

  useEffect(() => {
    const loadedTransactions = loadTransactions();
    const loadedCategories = loadCategories();
    setTransactions(loadedTransactions);
    setCategories(loadedCategories);

    // Calculate Income, Expense, Balance
    const incomeTotal = loadedTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expenseTotal = loadedTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    setIncome(incomeTotal);
    setExpense(expenseTotal);
    setBalance(incomeTotal - expenseTotal);

    // Get latest 5 transactions (sorted by date descending, then by id)
    const sorted = [...loadedTransactions].sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
    setLatestTransactions(sorted.slice(0, 5));
  }, []);

  // Listen for storage changes to update when data changes in other tabs/components
  useEffect(() => {
    const handleStorageChange = () => {
      const loadedTransactions = loadTransactions();
      const loadedCategories = loadCategories();
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);

      const incomeTotal = loadedTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const expenseTotal = loadedTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      setIncome(incomeTotal);
      setExpense(expenseTotal);
      setBalance(incomeTotal - expenseTotal);

      const sorted = [...loadedTransactions].sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.id.localeCompare(a.id);
      });
      setLatestTransactions(sorted.slice(0, 5));
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for changes (since same-tab changes don't trigger storage event)
    const interval = setInterval(() => {
      const currentTransactions = loadTransactions();
      if (JSON.stringify(currentTransactions) !== JSON.stringify(transactions)) {
        handleStorageChange();
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [transactions]);

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-xs text-slate-400">Income</div>
          <div className="text-2xl font-semibold mt-1">€ {income.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-xs text-slate-400">Expense</div>
          <div className="text-2xl font-semibold mt-1">€ {expense.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-xs text-slate-400">Balance</div>
          <div className="text-2xl font-semibold mt-1">€ {balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm font-semibold mb-2">Latest Transactions</div>
        {latestTransactions.length === 0 ? (
          <div className="text-sm text-slate-400">S'ka ende transaksione.</div>
        ) : (
          <div className="space-y-2">
            {latestTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-400">{transaction.date}</div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transaction.type === "income"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-red-900/30 text-red-300"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {getCategoryName(transaction.categoryId)}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {transaction.type === "income" ? "+" : "-"}€{" "}
                  {parseFloat(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
