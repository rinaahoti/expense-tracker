import { useEffect, useMemo, useState } from "react";
import { transactionsAPI, categoriesAPI } from "../lib/api.js";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ q: "", type: "all", date: "" });
  const [sort, setSort] = useState("date"); // date, amount, created_at
  const [sortOrder, setSortOrder] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    category_id: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      setTransactions(transactionsData.transactions || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setForm({
        date: transaction.date,
        type: transaction.type,
        category_id: transaction.category_id || "",
        amount: transaction.amount?.toString?.() ?? "",
        description: transaction.description || "",
      });
      setEditingId(transaction.id);
    } else {
      setForm({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category_id: "",
        amount: "",
        description: "",
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      category_id: "",
      amount: "",
      description: "",
    });
  };

  const handleSave = async () => {
    if (!form.date || !form.category_id || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    setSaving(true);
    try {
      const transactionData = {
        date: form.date,
        type: form.type,
        category_id: form.category_id,
        amount: amount,
        description: form.description.trim(),
      };

      if (editingId) {
        const updatedTransaction = await transactionsAPI.update(editingId, transactionData);
        setTransactions(transactions.map(t =>
          t.id === editingId ? { ...updatedTransaction, category_name: getCategoryName(updatedTransaction.category_id) } : t
        ));
      } else {
        const newTransaction = await transactionsAPI.create(transactionData);
        setTransactions([...transactions, { ...newTransaction, category_name: getCategoryName(newTransaction.category_id) }]);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("A je i sigurt që dëshiron ta fshish këtë transaksion?")) return;

    try {
      await transactionsAPI.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const filteredCategories = useMemo(
    () => categories.filter((cat) => true), // All categories for now since backend doesn't have type field
    [categories]
  );

  const filteredTransactions = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (q) {
        const categoryName = (t.category_name || getCategoryName(t.category_id) || "").toLowerCase();
        const description = (t.description || "").toLowerCase();
        if (!categoryName.includes(q) && !description.includes(q)) return false;
      }
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.date && t.date !== filters.date) return false;
      return true;
    });
  }, [transactions, filters, categories]);

  const sortedTransactions = useMemo(() => {
    const arr = [...filteredTransactions];

    arr.sort((a, b) => {
      let comparison = 0;

      if (sort === "date") {
        comparison = (b.date || "").localeCompare(a.date || "");
      } else if (sort === "amount") {
        comparison = (b.amount || 0) - (a.amount || 0);
      } else if (sort === "created_at") {
        comparison = new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return arr;
  }, [filteredTransactions, sort, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Track your income and expenses</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
            <input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="input-modern w-full"
              placeholder="Search transactions..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-modern w-full"
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Date</label>
            <input
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="input-modern w-full"
              type="date"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Sort By</label>
            <select
              value={`${sort}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSort(field);
                setSortOrder(order);
              }}
              className="input-modern w-full"
            >
              <option value="date_desc">Date (newest first)</option>
              <option value="date_asc">Date (oldest first)</option>
              <option value="amount_desc">Amount (high to low)</option>
              <option value="amount_asc">Amount (low to high)</option>
              <option value="created_at_desc">Created (newest)</option>
              <option value="created_at_asc">Created (oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-modern">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="p-4 text-left font-semibold text-slate-900">Date</th>
              <th className="p-4 text-left font-semibold text-slate-900">Type</th>
              <th className="p-4 text-left font-semibold text-slate-900">Category</th>
              <th className="p-4 text-left font-semibold text-slate-900">Description</th>
              <th className="p-4 text-left font-semibold text-slate-900">Amount</th>
              <th className="p-4 text-left font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={6}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="loading-spinner"></div>
                    Loading transactions...
                  </div>
                </td>
              </tr>
            ) : sortedTransactions.length === 0 ? (
              <tr>
                <td className="p-12 text-center text-slate-500" colSpan={6}>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-600 mb-4">No transactions found</p>
                  <button onClick={() => openModal()} className="btn-primary">
                    Add Your First Transaction
                  </button>
                </td>
              </tr>
            ) : (
              sortedTransactions.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="p-4 text-slate-900">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{t.category_name || getCategoryName(t.category_id)}</td>
                  <td className="p-4 text-slate-700">{t.description || '-'}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}€{Number(t.amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(t)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: "" })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Category</label>
                {filteredCategories.length === 0 ? (
                  <div className="mt-1 text-xs text-slate-500">
                    S'ka kategori. Krijo kategori fillimisht.
                  </div>
                ) : (
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                    required
                  >
                    <option value="">Select category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                  placeholder="Description..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={saving}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.date || !form.category_id || !form.amount || filteredCategories.length === 0}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading-spinner"></div>
                    Saving...
                  </div>
                ) : (
                  editingId ? "Update Transaction" : "Add Transaction"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
