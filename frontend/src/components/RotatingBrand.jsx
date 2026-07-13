import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useConfig } from "../context/ConfigContext";

// C-words in context; the configured brand short name is appended as the
// word the cycle settles on. Locale stays static beside it.
const WORDS = [
  "Create",
  "Coordinate",
  "Collaborate",
  "Community",
  "Convene",
  "Connect",
  "Care",
  "Commune",
  "Contribute",
  "Courage",
];

// Subtle per-word color variation (approved) from the palette variables in
// index.css. The brand word lands on clay — human action.
const COLORS = [
  "var(--orient-deep)",
  "var(--amber-deep)",
  "var(--violet-deep)",
  "var(--orient-deep)",
  "var(--clay-deep)",
  "var(--orient-deep)",
  "var(--violet-deep)",
  "var(--amber-deep)",
  "var(--orient-deep)",
  "var(--violet-deep)",
];
const BRAND_COLOR = "var(--clay)";

// Cadence. Dwell is how long a word stays readable before the next one.
const REST_DWELL = 1700; // regular word, at rest
const BRAND_DWELL = 4600; // the brand word holds noticeably longer
const FAST_DWELL = 110; // full-energy spin
const DECAY_TAU = 620; // ms; how quickly pointer energy drains
const SPEED_FULL = 1.4; // px/ms of pointer movement that counts as full energy

export function RotatingBrand({ className = "", localeOverride }) {
  const { region, brand } = useConfig();
  const prefersReduced = useReducedMotion();
  const locale = localeOverride || region?.defaultCity || "Santa Fe";
  const brandWord = brand?.short || "Cultivate";
  const words = [...WORDS, brandWord];
  const brandIndex = words.length - 1;

  const [i, setI] = useState(0);
  const indexRef = useRef(0);
  const lenRef = useRef(words.length);
  lenRef.current = words.length;
  const brandIndexRef = useRef(brandIndex);
  brandIndexRef.current = brandIndex;
  // Pointer energy in [0,1]; decays toward 0, movement pushes it up.
  const energyRef = useRef({ value: 0, t: 0 });
  const pointerRef = useRef({ x: 0, y: 0, t: null });
  const timerRef = useRef(null);
  const lastStepRef = useRef(0);
  const durRef = useRef(0.3);
  const rescheduleRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) {
      setI(brandIndexRef.current);
      return;
    }
    let cancelled = false;

    const decayedEnergy = (now) => {
      const e = energyRef.current;
      e.value *= Math.exp(-(now - e.t) / DECAY_TAU);
      e.t = now;
      return e.value;
    };

    const dwellFor = (index, energy) => {
      const rest = index === brandIndexRef.current ? BRAND_DWELL : REST_DWELL;
      return FAST_DWELL + (rest - FAST_DWELL) * (1 - energy);
    };

    const step = () => {
      if (cancelled) return;
      const now = performance.now();
      const energy = decayedEnergy(now);
      const next = (indexRef.current + 1) % lenRef.current;
      indexRef.current = next;
      // Word transitions tighten as the cycle speeds up.
      durRef.current = 0.3 - 0.18 * energy;
      lastStepRef.current = now;
      setI(next);
      timerRef.current = setTimeout(step, dwellFor(next, energy));
    };

    const reschedule = () => {
      if (cancelled) return;
      const now = performance.now();
      const energy = energyRef.current.value;
      const elapsed = now - lastStepRef.current;
      const remaining = dwellFor(indexRef.current, energy) - elapsed;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(step, Math.max(40, remaining));
    };
    rescheduleRef.current = reschedule;

    // Intro: start at full energy so the cycle spins, decelerates, and eases
    // into readable pauses — then keeps cycling at rest cadence.
    energyRef.current = { value: 1, t: performance.now() };
    lastStepRef.current = performance.now();
    timerRef.current = setTimeout(step, 380);
    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
      rescheduleRef.current = null;
    };
  }, [prefersReduced]);

  const onPointerMove = (ev) => {
    if (prefersReduced || ev.pointerType !== "mouse") return; // mobile deferred
    const now = performance.now();
    const p = pointerRef.current;
    if (p.t != null) {
      const dt = now - p.t;
      if (dt > 0) {
        const speed = Math.hypot(ev.clientX - p.x, ev.clientY - p.y) / dt;
        const e = energyRef.current;
        const decayed = e.value * Math.exp(-(now - e.t) / DECAY_TAU);
        e.value = Math.max(decayed, Math.min(1, speed / SPEED_FULL));
        e.t = now;
        // Fast movement should take effect now, not after the pending dwell.
        rescheduleRef.current?.();
      }
    }
    p.x = ev.clientX;
    p.y = ev.clientY;
    p.t = now;
  };

  const onPointerLeave = () => {
    pointerRef.current.t = null;
  };

  return (
    <span
      className={`inline-flex items-baseline gap-[0.3em] ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span className="relative inline-block overflow-hidden" style={{ height: "1.08em", minWidth: "4.5ch" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-105%", opacity: 0 }}
            transition={{ duration: durRef.current, ease: [0.22, 0.61, 0.36, 1] }}
            className="inline-block font-display whitespace-nowrap"
            style={{ color: i === brandIndex ? BRAND_COLOR : COLORS[i % COLORS.length], fontWeight: 460 }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="font-display" style={{ fontWeight: 460 }}>{locale}</span>
    </span>
  );
}
