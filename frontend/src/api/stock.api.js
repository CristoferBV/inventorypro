import http from "./http";

const base = "/api/stock";

export const StockApi = {
  receive: (payload) => http.post(`${base}/receive`, payload),
  issue: (payload) => http.post(`${base}/issue`, payload),
  adjust: (payload) => http.post(`${base}/adjust`, payload),
};
