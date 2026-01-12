import http from "./http";

const base = "/api/stockmovements";

export const MovementsApi = {
  // GET /api/stockmovements?productId=1&take=50
  list: ({ productId, take = 50 } = {}) =>
    http.get(base, {
      params: {
        productId: productId || undefined,
        take,
      },
    }),
};
