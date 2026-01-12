import http from "./http";

const base = "/api/categories";

export const CategoriesApi = {
  list: () => http.get(base),
  get: (id) => http.get(`${base}/${id}`),
  create: (payload) => http.post(base, payload),
  update: (id, payload) => http.put(`${base}/${id}`, payload),
  remove: (id) => http.delete(`${base}/${id}`),
};
