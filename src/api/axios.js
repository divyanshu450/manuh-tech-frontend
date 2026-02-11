import axios from "axios";

const api = axios.create({
  baseURL: "/api",   // thanks to proxy → goes to 8080
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;