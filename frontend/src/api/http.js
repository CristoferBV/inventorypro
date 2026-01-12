import axios from "axios";

const http = axios.create({
  baseURL: "https://localhost:7257", // backend
});

export default http;
