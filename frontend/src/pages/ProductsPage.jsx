// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { ProductsApi } from "../api/products.api";
import { CategoriesApi } from "../api/categories.api";

const initialForm = {
  id: null,
  sku: "",
  name: "",
  cost: 0,
  price: 0,
  stockMin: 0,
  isActive: true,
  categoryId: "",
};

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickApiError(err, fallback = "Unexpected error") {
  // Soporta: .NET string responses / problem details / axios
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.title) return data.title;
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
}

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  // query state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const isEdit = !!form?.id;

  const totalPages = useMemo(() => {
    const p = Math.ceil((total || 0) / (pageSize || 10));
    return p <= 0 ? 1 : p;
  }, [total, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const res = await CategoriesApi.list();
      setCategories(res.data ?? []);
    } catch (e) {
      // no bloquea products, solo avisa
      console.error(e);
    } finally {
      setCatLoading(false);
    }
  };

  const loadProducts = async ({ keepPage = false } = {}) => {
    setLoading(true);
    setErr("");
    try {
      const res = await ProductsApi.list({ search, page, pageSize });
      const data = res.data ?? {};
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);

      // Si backend corrige page/pageSize, puedes sincronizar:
      if (!keepPage && data.page && data.page !== page) setPage(data.page);
      if (data.pageSize && data.pageSize !== pageSize) setPageSize(data.pageSize);
    } catch (e) {
      setErr(pickApiError(e, "Error loading products"));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts({ keepPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, pageSize]);

  const onSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openNew = () => {
    setErr("");
    setForm({ ...initialForm, categoryId: categories?.[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = async (row) => {
    setErr("");
    try {
      // Trae detalle (por si el list no trae todo)
      const res = await ProductsApi.getById(row.id);
      const p = res.data;

      setForm({
        id: p.id,
        sku: p.sku ?? "",
        name: p.name ?? "",
        // backend list dto no trae cost/stockMin; asumimos que tu GetById lo trae si lo agregas
        // si NO lo trae, deja defaults:
        cost: p.cost ?? 0,
        price: p.price ?? 0,
        stockMin: p.stockMin ?? 0,
        isActive: p.isActive ?? true,
        categoryId: p.categoryId ?? "",
      });

      setOpen(true);
    } catch (e) {
      setErr(pickApiError(e, "Error loading product"));
    }
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setForm(initialForm);
  };

  const validate = () => {
    const sku = (form.sku ?? "").trim();
    const name = (form.name ?? "").trim();
    const categoryId = toNumber(form.categoryId);

    if (!sku) return "SKU is required.";
    if (!name) return "Name is required.";
    if (!categoryId) return "Category is required.";
    if (toNumber(form.cost) < 0 || toNumber(form.price) < 0) return "Cost/Price must be >= 0.";
    if (toNumber(form.stockMin) < 0) return "StockMin must be >= 0.";
    return "";
  };

  const onSave = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: (form.sku ?? "").trim(),
        name: (form.name ?? "").trim(),
        cost: toNumber(form.cost),
        price: toNumber(form.price),
        stockMin: toNumber(form.stockMin),
        isActive: !!form.isActive,
        categoryId: toNumber(form.categoryId),
      };

      if (isEdit) {
        await ProductsApi.update(form.id, payload);
      } else {
        await ProductsApi.create(payload);
      }

      closeModal();
      await loadProducts({ keepPage: true });
    } catch (e2) {
      setErr(pickApiError(e2, "Error saving product"));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    setErr("");
    const ok = window.confirm(`Delete product "${row.name}"?`);
    if (!ok) return;

    try {
      await ProductsApi.remove(row.id);

      // si borras el último de la página, baja una página si aplica
      const willBeEmpty = items.length === 1 && page > 1;
      if (willBeEmpty) setPage((p) => p - 1);
      else await loadProducts({ keepPage: true });
    } catch (e) {
      setErr(pickApiError(e, "Error deleting product"));
    }
  };

  return (
    <div className="rounded-xl bg-white/5 p-5 shadow-sm ring-1 ring-white/10">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Products</h2>
          <p className="text-sm text-white/60">Create, edit and manage products.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search by name or sku..."
              className="h-10 w-full min-w-[220px] rounded-lg bg-black/20 px-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 sm:w-[280px]"
            />
            <button
              onClick={onSearch}
              className="h-10 rounded-lg bg-white/10 px-3 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
            >
              Search
            </button>
          </div>

          <button
            onClick={openNew}
            className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New product
          </button>
        </div>
      </div>

      {err ? (
        <div className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/20">
          {err}
        </div>
      ) : null}

      <div className="rounded-xl bg-black/20 p-4 ring-1 ring-white/10">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/70">
            <span className="font-medium text-white">{total}</span> item(s)
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white/60">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
              className="h-9 rounded-lg bg-black/30 px-2 text-sm text-white ring-1 ring-white/10 outline-none"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadProducts({ keepPage: true })}
              className="h-9 rounded-lg bg-white/10 px-3 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs uppercase text-white/60">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={6}>
                    No products found.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{p.sku}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-white/70">{p.categoryName || "-"}</td>
                    <td className="px-4 py-3">{toNumber(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.isActive
                            ? "rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-500/20"
                            : "rounded-full bg-white/10 px-2 py-1 text-xs text-white/60 ring-1 ring-white/10"
                        }
                      >
                        {p.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="h-8 rounded-lg bg-white/10 px-3 text-xs text-white ring-1 ring-white/10 hover:bg-white/15"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="h-8 rounded-lg bg-red-600/20 px-3 text-xs text-red-200 ring-1 ring-red-500/20 hover:bg-red-600/30"
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

        {/* Pagination */}
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/60">
            Page <span className="text-white">{page}</span> of{" "}
            <span className="text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-lg bg-white/10 px-3 text-sm text-white ring-1 ring-white/10 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 rounded-lg bg-white/10 px-3 text-sm text-white ring-1 ring-white/10 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#0b1220] p-5 ring-1 ring-white/10">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isEdit ? "Edit product" : "New product"}
                </h3>
                <p className="text-sm text-white/60">
                  {isEdit ? "Update the product information." : "Create a new product."}
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={onSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ABC-001"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                    disabled={catLoading}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {catLoading ? "Loading..." : "Select category"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/20 bg-black/20"
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Stock Min</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={form.stockMin}
                    onChange={(e) => setForm((f) => ({ ...f, stockMin: e.target.value }))}
                    className="h-10 w-full rounded-lg bg-black/20 px-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-10 rounded-lg bg-white/10 px-4 text-sm text-white ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                  type="submit"
                >
                  {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
