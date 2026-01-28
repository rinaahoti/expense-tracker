import { useState, useEffect } from "react";
import { loadCategories, saveCategories } from "../utils/storage.js";
import { uid } from "../utils/id.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "expense" });

  useEffect(() => {
    const loaded = loadCategories();
    setCategories(loaded);
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setForm({ name: category.name, type: category.type });
      setEditingId(category.id);
    } else {
      setForm({ name: "", type: "expense" });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ name: "", type: "expense" });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    let updated;
    if (editingId) {
      updated = categories.map((cat) =>
        cat.id === editingId ? { ...cat, name: form.name.trim(), type: form.type } : cat
      );
    } else {
      updated = [...categories, { id: uid(), name: form.name.trim(), type: form.type }];
    }

    setCategories(updated);
    saveCategories(updated);
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm("A je i sigurt që dëshiron ta fshish këtë kategori?")) {
      const updated = categories.filter((cat) => cat.id !== id);
      setCategories(updated);
      saveCategories(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={() => openModal()}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm hover:bg-slate-900/70"
        >
          + Add
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr className="border-t border-slate-800">
                <td className="p-3 text-slate-400" colSpan={3}>
                  S'ka kategori ende.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t border-slate-800">
                  <td className="p-3">{category.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-800">
                      {category.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="text-xs text-slate-300 hover:text-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                  placeholder="Category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-slate-600"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-100 text-slate-950 px-3 py-2 text-sm font-semibold hover:bg-white"
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










