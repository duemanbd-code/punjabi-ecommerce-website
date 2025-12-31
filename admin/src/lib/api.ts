// admin/src/lib/api.ts

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Automatically set token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("admin-token");
  if (token) setAuthToken(token);
}
