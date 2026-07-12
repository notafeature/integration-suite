import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  withCredentials: true,
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
