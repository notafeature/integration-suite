import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "../context/ConfigContext";

// C-words that rotate and settle on the brand ("Cultivate"); locale stays static.
const WORDS = ["Create", "Coordinate", "Collaborate", "Community", "Convene", "Cultivate"];
const COLORS = [
  "var(--orient-deep)", "var(--amber-deep)", "var(--violet-deep)",
  "var(--orient-deep)", "var(--amber-deep)", "var(--clay)",
];
const DELAYS = [120, 130, 150, 190, 250, 340];

export function RotatingBrand({ className = "", localeOverride }) {
  const { region, brand } = useConfig();
  const locale = localeOverride || region?.defaultCity || "Santa Fe";
  // ensure last word matches the configured brand short name
  const words = [...WORDS.slice(0, -1), brand?.short || "Cultivate"];
  const [i, setI] = useState(0);

  useEffect(() => {
    let idx = 0;
    let timer;
    const step = () => {
      if (idx < words.length - 1) {
        idx += 1;
        setI(idx);
        timer = setTimeout(step, DELAYS[Math.min(idx, DELAYS.length - 1)]);
      }
    };
    timer = setTimeout(step, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  return (
    <span className={`inline-flex items-baseline gap-[0.3em] ${className}`}>
      <span className="relative inline-block overflow-hidden" style={{ height: "1.08em", minWidth: "4.5ch" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-105%", opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="inline-block font-display whitespace-nowrap"
            style={{ color: COLORS[i], fontWeight: 460 }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="font-display" style={{ fontWeight: 460 }}>{locale}</span>
    </span>
  );
}
