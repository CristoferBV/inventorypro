// src/pages/CategoriesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { CategoriesApi } from "../api/categories.api";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await CategoriesApi.list();

      // Ajusta según tu backend:
      // - si devuelve array: res.data
      // - si devuelve { items: [] }: res.data.items
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];

      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => (c?.name ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const openCreate = () => {
    setCreating(true);
    setNewName("");
    setErr("");
  };

  const closeCreate = () => {
    setCreating(false);
    setNewName("");
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name ?? "");
    setErr("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    setBusyId("create");
    setErr("");
    try {
      // Ajusta el payload si tu backend espera otra forma
      await CategoriesApi.create({ name });
      closeCreate();
      await fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Error creating category");
    } finally {
      setBusyId(null);
    }
  };

  const onUpdate = async (id) => {
    const name = editName.trim();
    if (!name) return;

    setBusyId(id);
    setErr("");
    try {
      await CategoriesApi.update(id, { name });
      cancelEdit();
      await fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Error updating category");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this category?")) return;

    setBusyId(id);
    setErr("");
    try {
      await CategoriesApi.remove(id);
      await fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Error deleting category");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Categories</h2>
          <p className="mt-1 text-sm text-slate-300">
            Create, edit and remove categories used by products.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className={cn(
                "w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-100",
                "ring-1 ring-white/10 placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              )}
            />
          </div>

          {/* New */}
          <button
            onClick={openCreate}
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold",
              "bg-indigo-500 text-white hover:bg-indigo-400",
              "ring-1 ring-indigo-400/30",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            New category
          </button>
        </div>
      </div>

      {/* Error / Loading */}
      {err && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      {/* Table/Card */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-100">
            {loading ? "Loading..." : `${filtered.length} category(ies)`}
          </div>

          <button
            onClick={fetchAll}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold",
              "bg-white/5 text-slate-200 hover:bg-white/10",
              "ring-1 ring-white/10"
            )}
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 w-[220px] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-950/10">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={2}>
                    Loading categories...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-slate-300" colSpan={2}>
                    No categories found.
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((c) => {
                  const isEditing = editingId === c.id;
                  const isBusy = busyId === c.id;

                  return (
                    <tr key={c.id ?? c.name} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={cn(
                              "w-full max-w-md rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100",
                              "ring-1 ring-white/10 placeholder:text-slate-400",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            )}
                            placeholder="Category name"
                          />
                        ) : (
                          <div className="font-medium text-slate-100">
                            {c.name}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => onUpdate(c.id)}
                                disabled={isBusy || !editName.trim()}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-xs font-semibold",
                                  "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20",
                                  "ring-1 ring-emerald-500/25",
                                  "disabled:opacity-60 disabled:cursor-not-allowed"
                                )}
                              >
                                {isBusy ? "Saving..." : "Save"}
                              </button>

                              <button
                                onClick={cancelEdit}
                                disabled={isBusy}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-xs font-semibold",
                                  "bg-white/5 text-slate-200 hover:bg-white/10",
                                  "ring-1 ring-white/10",
                                  "disabled:opacity-60 disabled:cursor-not-allowed"
                                )}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(c)}
                                disabled={busyId === "create" || isBusy}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-xs font-semibold",
                                  "bg-white/5 text-slate-200 hover:bg-white/10",
                                  "ring-1 ring-white/10",
                                  "disabled:opacity-60 disabled:cursor-not-allowed"
                                )}
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => onDelete(c.id)}
                                disabled={busyId === "create" || isBusy}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-xs font-semibold",
                                  "bg-red-500/15 text-red-200 hover:bg-red-500/20",
                                  "ring-1 ring-red-500/25",
                                  "disabled:opacity-60 disabled:cursor-not-allowed"
                                )}
                              >
                                {isBusy ? "Deleting..." : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeCreate}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    New category
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Add a new category for products.
                  </p>
                </div>

                <button
                  onClick={closeCreate}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Drinks"
                  className={cn(
                    "mt-2 w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-100",
                    "ring-1 ring-white/10 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  )}
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={closeCreate}
                  disabled={busyId === "create"}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold",
                    "bg-white/5 text-slate-200 hover:bg-white/10",
                    "ring-1 ring-white/10",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  Cancel
                </button>

                <button
                  onClick={onCreate}
                  disabled={busyId === "create" || !newName.trim()}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold",
                    "bg-indigo-500 text-white hover:bg-indigo-400",
                    "ring-1 ring-indigo-400/30",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {busyId === "create" ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
