import { useEffect, useMemo, useState } from "react";
import { MovementsApi } from "../api/movements.api";
import { ProductsApi } from "../api/products.api";

function pickApiError(err, fallback = "Unexpected error") {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.title) return data.title;
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
}

function fmtDate(utcString) {
  if (!utcString) return "-";
  const d = new Date(utcString);
  if (Number.isNaN(d.getTime())) return utcString;
  return d.toLocaleString();
}

function typeBadge(type) {
  const t = (type || "").toLowerCase();

  // Ajusta estos nombres si tu enum usa otros (Receive/Issue/Adjust)
  if (t.includes("receive")) {
    return (
      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-500/20">
        Receive
      </span>
    );
  }
  if (t.includes("issue")) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-200 ring-1 ring-red-500/20">
        Issue
      </span>
    );
  }
  if (t.includes("adjust")) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-200 ring-1 ring-amber-500/20">
        Adjust
      </span>
    );
  }

  return (
    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10">
      {type || "Unknown"}
    </span>
  );
}

export default function MovementsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [movements, setMovements] = useState([]);

  // filters
  const [take, setTake] = useState(50);
  const [productId, setProductId] = useState("");

  // products for select
  const [products, setProducts] = useState([]);

  // local search (front only)
  const [q, setQ] = useState("");

  const loadProducts = async () => {
    try {
      // traemos una lista razonable para el select
      const res = await ProductsApi.list({ page: 1, pageSize: 100, search: "" });
      setProducts(res?.data?.items ?? []);
    } catch {
      // si falla, igual dejamos la página funcionar (sin select)
      setProducts([]);
    }
  };

  const loadMovements = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await MovementsApi.list({
        productId: productId ? Number(productId) : undefined,
        take,
      });
      setMovements(res.data ?? []);
    } catch (e) {
      setErr(pickApiError(e, "Error loading movements"));
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [take, productId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return movements;
    return movements.filter((m) => {
      const sku = (m.sku || "").toLowerCase();
      const name = (m.productName || "").toLowerCase();
      const note = (m.note || "").toLowerCase();
      const type = (m.type || "").toLowerCase();
      return (
        sku.includes(s) ||
        name.includes(s) ||
        note.includes(s) ||
        type.includes(s)
      );
    });
  }, [movements, q]);

  return (
    <div className="rounded-xl bg-white/5 p-5 shadow-sm ring-1 ring-white/10">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Stock Movements</h2>
          <p className="text-sm text-white/60">History of stock changes.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (sku, name, note, type)..."
            className="h-10 w-full min-w-[240px] rounded-lg bg-black/20 px-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 sm:w-[320px]"
          />
          <button
            onClick={loadMovements}
            className="h-10 rounded-lg bg-white/10 px-4 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Product</span>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-9 rounded-lg bg-black/20 px-2 text-sm text-white ring-1 ring-white/10 outline-none"
            >
              <option value="">All</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Take</span>
            <select
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
              className="h-9 rounded-lg bg-black/20 px-2 text-sm text-white ring-1 ring-white/10 outline-none"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-white/70">
          <span className="font-medium text-white">{filtered.length}</span>{" "}
          item(s)
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
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Qty Change</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-white/60" colSpan={6}>
                    No movements found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const qChange = Number(m.quantityChange) || 0;
                  return (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white/70">
                        {fmtDate(m.createdAtUtc)}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {m.sku || "-"}
                      </td>
                      <td className="px-4 py-3">{m.productName || "-"}</td>
                      <td className="px-4 py-3">{typeBadge(m.type)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            qChange > 0
                              ? "text-emerald-200"
                              : qChange < 0
                              ? "text-red-200"
                              : "text-white/70"
                          }
                        >
                          {qChange > 0 ? `+${qChange}` : `${qChange}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {m.note || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
