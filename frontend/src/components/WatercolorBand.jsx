import React from "react";

// §8B — high-desert watercolor band, above the footer. Soft dawn/dusk washes
// in warm neutrals, fine dried-botanical line art, a centered italic quote,
// and a small chevron divider. All colors come from the palette variables so
// the band follows the Field/Warm presets and never fights the canvas.

// Dried seed-head skeleton: bare stem, radiating spokes, tiny tip dots.
function SeedHead({ x, y, r = 15, spokes = 14, tilt = 0 }) {
  const angles = Array.from({ length: spokes }, (_, k) => tilt + (k * 360) / spokes);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,64 C2,42 -2,20 0,0" fill="none" strokeWidth="0.9" />
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180;
        const tx = r * Math.cos(rad);
        const ty = r * Math.sin(rad);
        return (
          <g key={a}>
            <line x1="0" y1="0" x2={tx} y2={ty} strokeWidth="0.55" />
            <circle cx={tx} cy={ty} r="0.9" fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </g>
  );
}

// Chamisa-like sprig: forking stem, each tip carrying a small broom of strokes.
function Chamisa({ x, y, flip = false }) {
  const brooms = [
    { tx: -14, ty: -40, spread: 26 },
    { tx: 2, ty: -52, spread: 30 },
    { tx: 15, ty: -38, spread: 24 },
  ];
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1,1)" : ""}`}>
      <path d="M0,0 C1,-14 -2,-26 -14,-40" fill="none" strokeWidth="0.8" />
      <path d="M0,0 C0,-20 1,-38 2,-52" fill="none" strokeWidth="0.8" />
      <path d="M0,0 C2,-12 6,-24 15,-38" fill="none" strokeWidth="0.8" />
      {brooms.map(({ tx, ty, spread }) => (
        <g key={`${tx}${ty}`} transform={`translate(${tx} ${ty})`}>
          {[-spread, -spread / 2, 0, spread / 2, spread].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            return (
              <line key={deg} x1="0" y1="0" x2={7 * Math.cos(rad)} y2={7 * Math.sin(rad)} strokeWidth="0.5" />
            );
          })}
        </g>
      ))}
    </g>
  );
}

function GrassBlades({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,0 C-4,-22 -2,-40 6,-58" fill="none" strokeWidth="0.6" />
      <path d="M6,0 C6,-18 10,-32 22,-46" fill="none" strokeWidth="0.6" />
      <path d="M-6,0 C-10,-14 -16,-24 -26,-32" fill="none" strokeWidth="0.6" />
    </g>
  );
}

function Botanicals({ className, style }) {
  return (
    <svg
      viewBox="0 0 240 130"
      width="240"
      height="130"
      aria-hidden="true"
      className={className}
      style={{ stroke: "var(--ink-soft)", color: "var(--ink-soft)", ...style }}
    >
      <SeedHead x={52} y={38} r={16} spokes={15} tilt={8} />
      <SeedHead x={96} y={62} r={10} spokes={11} tilt={-14} />
      <Chamisa x={158} y={126} />
      <GrassBlades x={206} y={128} />
    </svg>
  );
}

export function WatercolorBand({
  quote = "Healing happens in relationship. Integration happens in community.",
}) {
  return (
    <section className="relative overflow-hidden" data-testid="watercolor-band">
      {/* Washes stretch with the band; edges roughened into watercolor blooms. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="wc-bloom" x="-10%" y="-30%" width="120%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="3" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <filter id="wc-edge" x="-10%" y="-200%" width="120%" height="500%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.05" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
          </filter>
          <linearGradient id="wc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--canvas)" stopOpacity="0" />
            <stop offset="0.72" stopColor="var(--amber)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="wc-dusk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--violet)" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="var(--violet)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="wc-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--amber-deep)" stopOpacity="0.4" />
            <stop offset="1" stopColor="var(--canvas)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* dawn sky settling toward the horizon */}
        <rect x="-40" y="0" width="1520" height="268" fill="url(#wc-sky)" opacity="0.14" filter="url(#wc-bloom)" />
        {/* dusk cross-light */}
        <rect x="-40" y="150" width="1520" height="118" fill="url(#wc-dusk)" opacity="0.12" filter="url(#wc-bloom)" />
        {/* distant mesa */}
        <path
          d="M-40,262 L240,258 C360,236 470,232 560,246 L740,262 L1480,262 L1480,300 L-40,300 Z"
          fill="var(--violet)"
          opacity="0.085"
          filter="url(#wc-bloom)"
        />
        {/* foreground ground wash */}
        <rect x="-40" y="268" width="1520" height="152" fill="url(#wc-ground)" opacity="0.13" filter="url(#wc-bloom)" />
        {/* fine hand-drawn horizon line */}
        <line
          x1="-20"
          y1="266"
          x2="1460"
          y2="264"
          stroke="var(--ink-soft)"
          strokeWidth="0.8"
          opacity="0.28"
          filter="url(#wc-edge)"
        />
      </svg>

      {/* Botanical line art keeps its stroke weight — anchored to the ground line. */}
      <Botanicals className="absolute bottom-8 left-[4%] opacity-[0.38]" />
      <Botanicals
        className="absolute bottom-10 right-[3%] hidden opacity-[0.3] sm:block"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:py-28">
        <p className="font-display text-xl italic leading-relaxed text-ink/90 sm:text-[1.55rem]">
          “{quote}”
        </p>
        <span className="mt-7 select-none text-[13px] tracking-[0.45em] text-amber-deep/75" aria-hidden="true">
          »»»
        </span>
      </div>
    </section>
  );
}
