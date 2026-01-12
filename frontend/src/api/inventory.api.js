import http from "./http";

const base = "/api/inventory";

export const InventoryApi = {
  // GET /api/inventory?search=&onlyLowStock=false&onlyActive=true
  list: ({ search = "", onlyLowStock = false, onlyActive = true } = {}) =>
    http.get(base, {
      params: {
        search: search || undefined,
        onlyLowStock,
        onlyActive,
      },
    }),

  // GET /api/inventory/{productId}
  get: (productId) => http.get(`${base}/${productId}`),
};
