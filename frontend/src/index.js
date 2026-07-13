import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// apply saved palette before first paint
const savedTheme = localStorage.getItem("cultivate_theme") || "field";
document.documentElement.dataset.theme = savedTheme;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
