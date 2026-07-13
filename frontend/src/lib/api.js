import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

// Bearer-token auth (no cookies) — avoids the ingress rewriting
// Access-Control-Allow-Origin to "*", which browsers reject with credentials.
const api = axios.create({
  baseURL: `${BACKEND}/api`,
  withCredentials: false,
});

const saved = localStorage.getItem("cultivate_token");
if (saved) api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;

export function setToken(token) {
  if (token) {
    localStorage.setItem("cultivate_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("cultivate_token");
    delete api.defaults.headers.common["Authorization"];
  }
}

export const BACKEND_URL = BACKEND;
export default api;
