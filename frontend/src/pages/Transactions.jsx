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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <button
          onClick={() => openModal()}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900/70"
        >
          + Add
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm text-slate-300 mb-3">Filters</div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none"
            placeholder="Search..."
          />

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none"
            type="date"
          />

          <select
            value={`${sort}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('_');
              setSort(field);
              setSortOrder(order);
            }}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none"
          >
            <option value="date_desc">Sort: Date (newest)</option>
            <option value="date_asc">Sort: Date (oldest)</option>
            <option value="amount_desc">Sort: Amount (high → low)</option>
            <option value="amount_asc">Sort: Amount (low → high)</option>
            <option value="created_at_desc">Sort: Created (newest)</option>
            <option value="created_at_asc">Sort: Created (oldest)</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t border-slate-800">
                <td className="p-3 text-slate-400 text-center" colSpan={5}>
                  Loading transactions...
                </td>
              </tr>
            ) : sortedTransactions.length === 0 ? (
              <tr className="border-t border-slate-800">
                <td className="p-3 text-slate-400" colSpan={5}>
                  S'ka transaksione ende.
                </td>
              </tr>
            ) : (
              sortedTransactions.map((t) => (
                <tr key={t.id} className="border-t border-slate-800">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-800">{t.type}</span>
                  </td>
                  <td className="p-3">{t.category_name || getCategoryName(t.category_id)}</td>
                  <td className="p-3">€ {Number(t.amount || 0).toFixed(2)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(t)}
                        className="text-xs text-slate-300 hover:text-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
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

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.date || !form.category_id || !form.amount || filteredCategories.length === 0}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-100 text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={closeModal}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
