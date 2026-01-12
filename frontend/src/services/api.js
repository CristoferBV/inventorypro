import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7257/api", // backend .NET
});

export default api;
