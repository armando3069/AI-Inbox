import axios from "axios";
import { API_URL } from "@/lib/config";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});
