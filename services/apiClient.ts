import axios, { AxiosInstance } from "axios";

// Browser → same-origin Next.js route handlers (app/api/**). Auth is carried
// by httpOnly cookies; the handlers talk to the backend via apiServer.
const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
