import { siteConfig } from "@/lib/site-config";

/** Stacked-stones cairn mark + wordmark. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <ellipse cx="11" cy="22" rx="10" ry="3.5" fill="currentColor" />
        <ellipse cx="10.4" cy="15.5" rx="7.5" ry="3" fill="currentColor" />
        <ellipse cx="11.4" cy="10" rx="5.5" ry="2.6" fill="currentColor" />
        <ellipse cx="10.8" cy="5.4" rx="3.6" ry="2.2" fill="currentColor" />
      </svg>
      <span
        className="text-xl tracking-tight"
        style={{ fontFamily: "var(--font-display)", fontWeight: 560 }}
      >
        {siteConfig.name}
      </span>
    </span>
  );
}
