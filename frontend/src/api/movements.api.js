import { http } from "./http";

export const MovementsApi = {
  list: () => http.get("/api/StockMovements"),
};
