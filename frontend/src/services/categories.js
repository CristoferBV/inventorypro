import api from "./api";

export const getCategories = async () => {
  const res = await api.get("/Categories");
  return res.data;
};
