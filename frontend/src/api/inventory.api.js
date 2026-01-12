import { http } from "./http";

export const InventoryApi = {
  list: () => http.get("/api/Inventory"),
  getByProduct: (productId) => http.get(`/api/Inventory/${productId}`),
};
