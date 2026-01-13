import { useEffect, useMemo, useState } from "react";
import { ProductsApi } from "../api/products.api";
import { StockApi } from "../api/stock.api";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdjustStockPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(0); // puede ser negativo o positivo
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await ProductsApi.list({ search: "", page: 1, pageSize: 100 });
        setProducts(res.data?.items ?? []);
      } catch (e) {
        setErr(e?.message ?? "Error loading products");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const selected = useMemo(
    () => products.find((p) => String(p.id) === String(productId)),
    [products, productId]
  );

  const canSubmit =
    !loadingProducts &&
    !submitting &&
    Number(productId) > 0 &&
    Number(quantity) !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const pid = Number(productId);
    const qty = Number(quantity);

    if (!pid) return setErr("Select a product.");
    if (!qty || qty === 0) return setErr("Quantity cannot be zero.");

    setSubmitting(true);
    try {
      const payload = {
        productId: pid,
        quantity: qty, // aquí sí puede ser negativo o positivo
        note: note?.trim() || null,
      };

      const res = await StockApi.adjust(payload);
      const newQty = res?.data?.newQuantity;

      setOk(
        `Stock adjusted successfully.${typeof newQty === "number" ? ` New quantity: ${newQty}` : ""}`
      );

      setQuantity(0);
      setNote("");
    } catch (e) {
      const msg =
        e?.response?.data ||
        e?.message ||
        "Error adjusting stock";
      setErr(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white">Adjust Stock</h2>
        <p className="text-sm text-slate-400">
          Manual correction (+ / -). Backend will prevent resulting negative stock.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-300">Product</label>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={loadingProducts}
            >
              <option value="">
                {loadingProducts ? "Loading products..." : "Select a product"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>

            {selected && (
              <div className="mt-2 text-xs text-slate-400">
                Category: <span className="text-slate-200">{selected.categoryName}</span>{" "}
                • StockMin: <span className="text-slate-200">{selected.stockMin ?? "—"}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Quantity change</label>
            <input
              type="number"
              step={1}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. -2 or 5"
            />
            <div className="mt-2 text-xs text-slate-400">
              Use negative to subtract (e.g. -2), positive to add (e.g. 5).
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-300">Note (recommended)</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Damaged product / Inventory recount"
            />
          </div>
        </div>

        {(err || ok) && (
          <div
            className={cn(
              "mt-4 rounded-xl border px-3 py-2 text-sm",
              err
                ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            )}
          >
            {err || ok}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10 hover:bg-white/10"
            onClick={() => {
              setErr("");
              setOk("");
              setProductId("");
              setQuantity(0);
              setNote("");
            }}
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
              canSubmit
                ? "bg-indigo-600/80 text-white ring-indigo-500/30 hover:bg-indigo-600"
                : "cursor-not-allowed bg-white/5 text-slate-400 ring-white/10"
            )}
          >
            {submitting ? "Saving..." : "Adjust Stock"}
          </button>
        </div>
      </form>
    </div>
  );
}
