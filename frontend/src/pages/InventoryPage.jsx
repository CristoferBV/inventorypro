import { useEffect, useMemo, useState } from "react";
import { InventoryApi } from "../api/inventory.api";

function pickApiError(err, fallback = "Unexpected error") {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.title) return data.title;
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // query
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const total = items.length;

  const lowCount = useMemo(
    () => items.filter((x) => Number(x.quantity) <= Number(x.stockMin)).length,
    [items]
  );

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await InventoryApi.list({ search, onlyLowStock, onlyActive });
      setItems(res.data ?? []);
    } catch (e) {
      setErr(pickApiError(e, "Error loading inventory"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, onlyLowStock, onlyActive]);

  const onSearch = () => setSearch(searchInput.trim());

  const statusBadge = (row) => {
    const qty = Number(row.quantity) || 0;
    const min = Number(row.stockMin) || 0;

    if (qty <= min) {
      return (
        <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-200 ring-1 ring-amber-500/20">
          LOW
        </span>
      );
    }
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-500/20">
        OK
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white/5 p-5 shadow-sm ring-1 ring-white/10">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Inventory</h2>
          <p className="text-sm text-white/60">Stock levels per product.</p>
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
            onClick={load}
            className="h-10 rounded-lg bg-white/10 px-4 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/20"
            />
            Only active
          </label>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/20"
            />
            Only low stock
          </label>
        </div>

        <div className="text-sm text-white/70">
          <span className="font-medium text-white">{total}</span> item(s)
          <span className="ml-3 text-white/50">
            Low (view): <span className="text-white">{lowCount}</span>
          </span>
        </div>
      </div>

      {err ? (
        <div className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/20">
          {err}
        </div>
      ) : null}

      <div className="rounded-xl bg-black/20 p-4 ring-1 ring-white/10">
        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs uppercase text-white/60">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Stock Min</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={7}>
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.productId} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{r.sku}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 text-white/70">{r.categoryName || "-"}</td>
                    <td className="px-4 py-3">{r.quantity}</td>
                    <td className="px-4 py-3">{r.stockMin}</td>
                    <td className="px-4 py-3">{statusBadge(r)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.isActive
                            ? "rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-500/20"
                            : "rounded-full bg-white/10 px-2 py-1 text-xs text-white/60 ring-1 ring-white/10"
                        }
                      >
                        {r.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
