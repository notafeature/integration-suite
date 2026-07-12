import React from "react";
import { useConfig } from "../context/ConfigContext";

/** Abstract stacked-marker mark + configurable wordmark (the cairn: stones marking the trail down). */
export function Wordmark({ className = "", onDark = false }) {
  const { brand } = useConfig();
  const color = onDark ? "#FAFAF8" : "var(--ink)";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="20" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true" className="shrink-0">
        <ellipse cx="11" cy="22" rx="10" ry="3.4" fill={color} opacity="0.9" />
        <ellipse cx="10.4" cy="15.6" rx="7.4" ry="2.9" fill={color} opacity="0.75" />
        <ellipse cx="11.4" cy="10" rx="5.4" ry="2.5" fill={color} opacity="0.6" />
        <ellipse cx="10.8" cy="5.4" rx="3.5" ry="2.1" fill={color} opacity="0.45" />
      </svg>
      <span className="font-display text-[1.05rem] tracking-tight" style={{ fontWeight: 560, color: onDark ? "#FAFAF8" : "var(--ink)" }}>
        {brand?.short || "Cultivate"}
      </span>
    </span>
  );
}
