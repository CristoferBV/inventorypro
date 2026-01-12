import { http } from "./http";

export const StockApi = {
  receive: (payload) => http.post("/api/Stock/receive", payload),
  issue: (payload) => http.post("/api/Stock/issue", payload),
  adjust: (payload) => http.post("/api/Stock/adjust", payload),
};
