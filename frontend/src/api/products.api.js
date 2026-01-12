import http from "./http";

const base = "/api/products";

export const ProductsApi = {
  // GET /api/products?search=&page=1&pageSize=10
  list: ({ search = "", page = 1, pageSize = 10 } = {}) =>
    http.get(base, {
      params: {
        search: search || undefined,
        page,
        pageSize,
      },
    }),

  // GET /api/products/{id}
  get: (id) => http.get(`${base}/${id}`),

  // POST /api/products
  create: (payload) => http.post(base, payload),

  // PUT /api/products/{id}
  update: (id, payload) => http.put(`${base}/${id}`, payload),

  // DELETE /api/products/{id}
  remove: (id) => http.delete(`${base}/${id}`),
};
