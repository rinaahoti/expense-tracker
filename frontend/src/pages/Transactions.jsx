import { useEffect, useMemo, useState } from "react";
import { loadTransactions, saveTransactions, loadCategories } from "../utils/storage.js";
import { uid } from "../utils/id.js";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: "", type: "all", date: "" });
  const [sort, setSort] = useState("date_desc"); // date_desc | date_asc | amount_desc | amount_asc
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    categoryId: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    setTransactions(loadTransactions());
    setCategories(loadCategories());
  }, []);

  const openModal = (transaction = null) => {
    if (transaction) {
      setForm({
        date: transaction.date,
        type: transaction.type,
        categoryId: transaction.categoryId || "",
        amount: transaction.amount?.toString?.() ?? "",
        note: transaction.note || "",
      });
      setEditingId(transaction.id);
    } else {
      setForm({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        categoryId: "",
        amount: "",
        note: "",
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
      categoryId: "",
      amount: "",
      note: "",
    });
  };

  const handleSave = () => {
    if (!form.date || !form.categoryId || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    let updated;
    if (editingId) {
      updated = transactions.map((t) =>
        t.id === editingId
          ? {
              ...t,
              date: form.date,
              type: form.type,
              categoryId: form.categoryId,
              amount,
              note: form.note.trim(),
            }
          : t
      );
    } else {
      updated = [
        ...transactions,
        {
          id: uid(),
          date: form.date,
          type: form.type,
          categoryId: form.categoryId,
          amount,
          note: form.note.trim(),
        },
      ];
    }

    setTransactions(updated);
    saveTransactions(updated);
    closeModal();
  };

  const handleDelete = (id) => {
    if (!confirm("A je i sigurt që dëshiron ta fshish këtë transaksion?")) return;
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === form.type),
    [categories, form.type]
  );

  const filteredTransactions = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (q) {
        const categoryName = getCategoryName(t.categoryId).toLowerCase();
        const note = (t.note || "").toLowerCase();
        if (!categoryName.includes(q) && !note.includes(q)) return false;
      }
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.date && t.date !== filters.date) return false;
      return true;
    });
  }, [transactions, filters, categories]);

  const sortedTransactions = useMemo(() => {
    const arr = [...filteredTransactions];

    arr.sort((a, b) => {
      if (sort === "date_desc") {
        if ((b.date || "") !== (a.date || "")) return (b.date || "").localeCompare(a.date || "");
        return (b.id || "").localeCompare(a.id || "");
      }
      if (sort === "date_asc") {
        if ((a.date || "") !== (b.date || "")) return (a.date || "").localeCompare(b.date || "");
        return (a.id || "").localeCompare(b.id || "");
      }
      if (sort === "amount_desc") return (b.amount || 0) - (a.amount || 0);
      if (sort === "amount_asc") return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    return arr;
  }, [filteredTransactions, sort]);

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
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none"
          >
            <option value="date_desc">Sort: Date (newest)</option>
            <option value="date_asc">Sort: Date (oldest)</option>
            <option value="amount_desc">Sort: Amount (high → low)</option>
            <option value="amount_asc">Sort: Amount (low → high)</option>
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
            {sortedTransactions.length === 0 ? (
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
                  <td className="p-3">{getCategoryName(t.categoryId)}</td>
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
                    S'ka kategori për {form.type}. Krijo kategori fillimisht.
                  </div>
                ) : (
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
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
                <label className="text-xs text-slate-400">Note (optional)</label>
                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                  placeholder="Note..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.date || !form.categoryId || !form.amount || filteredCategories.length === 0}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-100 text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900/70"
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
