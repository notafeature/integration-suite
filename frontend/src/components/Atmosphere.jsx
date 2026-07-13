import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// Site-wide high-desert atmosphere. A fixed background layer behind every
// page: watercolor ground washes rising to a horizon about a third from the
// top of the viewport, faint sky above it, botanical line art at the ground
// line, and one barely-there molecule drifting in the upper sky. The page you
// are on picks the molecule and the wash edges; the local clock picks dawn
// (day) or dusk (night). Everything reads from the palette variables.

// ---------- botanical line art ----------

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

// Small mushrooms sheltering at the base of the grasses — same stroke
// language as everything else, so they only appear to a patient eye.
function Mushrooms({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,0 C-0.5,-3 -0.5,-6 0,-8 M-4,-8 C-4,-12 4,-12 4,-8 Z" fill="none" strokeWidth="0.55" />
      <path d="M8,0 C7.7,-2 7.7,-4 8,-5.5 M5.4,-5.5 C5.4,-8.4 10.6,-8.4 10.6,-5.5 Z" fill="none" strokeWidth="0.5" />
    </g>
  );
}

// Columnar cactus (San Pedro-like): ribbed columns, one shouldered arm.
// Drawn small and placed at the horizon, where distance keeps it quiet.
function Tricho({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-3,0 L-3,-26 C-3,-31 3,-31 3,-26 L3,0" fill="none" strokeWidth="0.7" />
      <line x1="0" y1="-1" x2="0" y2="-28" strokeWidth="0.4" />
      <path d="M3,-14 C8,-15 9,-19 9,-22 C9,-25 13,-25 13,-22 L13,0" fill="none" strokeWidth="0.6" />
      <path d="M-9,0 L-9,-14 C-9,-18 -4,-18 -4,-14" fill="none" strokeWidth="0.55" />
    </g>
  );
}

// A small toad at rest: low domed back, folded haunch, a dot of an eye.
function Toad({ x, y, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1,1)" : ""}`}>
      <path d="M-7,0 C-9,-5 -4,-9 0,-9 C4,-9 8,-6 8,-2 C8,-1 7,0 6,0 Z" fill="none" strokeWidth="0.55" />
      <path d="M2,0 C1,-3 4,-5 6,-3" fill="none" strokeWidth="0.45" />
      <circle cx="-4" cy="-7" r="0.6" fill="currentColor" stroke="none" />
    </g>
  );
}

function Botanicals({ className, style, mirror = false }) {
  return (
    <svg
      viewBox="0 0 240 130"
      width="240"
      height="130"
      aria-hidden="true"
      className={className}
      style={{
        stroke: "var(--ink-soft)",
        color: "var(--ink-soft)",
        ...(mirror ? { transform: "scaleX(-1)" } : null),
        ...style,
      }}
    >
      <SeedHead x={52} y={38} r={16} spokes={15} tilt={8} />
      <SeedHead x={96} y={62} r={10} spokes={11} tilt={-14} />
      <Chamisa x={158} y={126} />
      <GrassBlades x={206} y={128} />
      <Mushrooms x={196} y={128} />
      <Toad x={124} y={127} flip />
    </svg>
  );
}

// ---------- molecules (skeletal formulas, near-invisible sky marks) ----------

function Indole() {
  return (
    <g>
      <polygon points="22.5,13 0,26 -22.5,13 -22.5,-13 0,-26 22.5,-13" fill="none" />
      <line x1="17.6" y1="10.1" x2="0" y2="20.3" />
      <line x1="-17.6" y1="10.1" x2="-17.6" y2="-10.1" />
      <line x1="0" y1="-20.3" x2="17.6" y2="-10.1" />
      <path d="M22.5,-13 L47,-21 L62,0 L47,21 L22.5,13" fill="none" />
      <line x1="44" y1="-15" x2="55" y2="-2" />
      <text x="50" y="32">NH</text>
    </g>
  );
}

function DimethylaminoChain() {
  return (
    <g>
      <path d="M47,-21 L68,-34 L90,-28 L100,-42" fill="none" />
      <text x="104" y="-46">N</text>
      <line x1="112" y1="-48" x2="130" y2="-38" />
      <line x1="103" y1="-58" x2="97" y2="-78" />
    </g>
  );
}

const MOLECULES = [
  {
    name: "dmt",
    body: (
      <g>
        <Indole />
        <DimethylaminoChain />
      </g>
    ),
  },
  {
    name: "5-meo-dmt",
    body: (
      <g>
        <Indole />
        <DimethylaminoChain />
        <line x1="-22.5" y1="-13" x2="-40" y2="-24" />
        <text x="-52" y="-26">O</text>
        <line x1="-54" y1="-34" x2="-68" y2="-46" />
      </g>
    ),
  },
  {
    name: "psilocybin",
    body: (
      <g>
        <Indole />
        <DimethylaminoChain />
        <line x1="0" y1="-26" x2="-4" y2="-44" />
        <text x="-9" y="-50">O</text>
        <line x1="-12" y1="-58" x2="-22" y2="-70" />
        <text x="-30" y="-74">P</text>
        <line x1="-36" y1="-74" x2="-54" y2="-66" />
        <line x1="-38" y1="-80" x2="-56" y2="-72" />
        <text x="-66" y="-66">O</text>
        <line x1="-30" y1="-84" x2="-26" y2="-94" />
        <text x="-28" y="-100">OH</text>
        <line x1="-38" y1="-84" x2="-48" y2="-90" />
        <text x="-62" y="-92">HO</text>
      </g>
    ),
  },
  {
    name: "mescaline",
    body: (
      <g>
        <polygon points="22.5,13 0,26 -22.5,13 -22.5,-13 0,-26 22.5,-13" fill="none" />
        <line x1="17.6" y1="10.1" x2="0" y2="20.3" />
        <line x1="-17.6" y1="10.1" x2="-17.6" y2="-10.1" />
        <line x1="0" y1="-20.3" x2="17.6" y2="-10.1" />
        <path d="M0,-26 L22,-40 L22,-66 L10,-76" fill="none" />
        <text x="-8" y="-80">H₂N</text>
        <line x1="22.5" y1="13" x2="40" y2="24" />
        <text x="44" y="32">O</text>
        <line x1="52" y1="36" x2="66" y2="48" />
        <line x1="0" y1="26" x2="0" y2="46" />
        <text x="-5" y="58">O</text>
        <line x1="6" y1="62" x2="20" y2="74" />
        <line x1="-22.5" y1="13" x2="-40" y2="24" />
        <text x="-54" y="32">O</text>
        <line x1="-56" y1="36" x2="-70" y2="48" />
      </g>
    ),
  },
];

// ---------- the layer ----------

const isDawn = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
};

export function Atmosphere() {
  const { pathname } = useLocation();
  const [dawn, setDawn] = useState(isDawn);

  useEffect(() => {
    const t = setInterval(() => setDawn(isDawn()), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const seed = useMemo(
    () => [...pathname].reduce((a, c) => a + c.charCodeAt(0), 7),
    [pathname]
  );
  const molecule = MOLECULES[seed % MOLECULES.length];
  const mirrorBotanicals = seed % 2 === 1;

  // Dawn: warmth gathers at the horizon, a violet hush high up.
  // Dusk: the inverse — violet settles low, a last amber remnant above.
  const low = dawn ? "var(--amber)" : "var(--violet)";
  const high = dawn ? "var(--violet)" : "var(--amber)";
  const lowDeep = dawn ? "var(--amber-deep)" : "var(--violet-deep)";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" data-phase={dawn ? "dawn" : "dusk"}>
      <svg className="atmo-drift absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <filter id="atmo-bloom" x="-10%" y="-30%" width="120%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="3" seed={seed % 29} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="46" />
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
          <filter id="atmo-edge" x="-10%" y="-300%" width="120%" height="700%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.05" numOctaves="2" seed={(seed % 29) + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
          </filter>
          <linearGradient id="atmo-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={high} stopOpacity="0.28" />
            <stop offset="0.55" stopColor={high} stopOpacity="0.05" />
            <stop offset="0.85" stopColor={low} stopOpacity="0.3" />
            <stop offset="1" stopColor={low} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="atmo-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lowDeep} stopOpacity="0.34" />
            <stop offset="0.28" stopColor={lowDeep} stopOpacity="0.1" />
            <stop offset="0.8" stopColor={lowDeep} stopOpacity="0.06" />
            <stop offset="1" stopColor={lowDeep} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* sky, settling into the horizon glow; night leans harder into violet */}
        <rect x="-40" y="-50" width="1520" height="360" fill="url(#atmo-sky)" opacity={dawn ? 0.14 : 0.24} filter="url(#atmo-bloom)" />
        {/* distant mesa on the horizon */}
        <path
          d="M-40,306 L200,302 C330,280 450,276 545,290 L730,306 L980,300 C1090,286 1200,288 1290,300 L1480,306 L1480,340 L-40,340 Z"
          fill={dawn ? "var(--violet)" : "var(--violet-deep)"}
          opacity={dawn ? 0.08 : 0.13}
          filter="url(#atmo-bloom)"
        />
        {/* ground: from the horizon all the way down — the page sits on the field */}
        <rect x="-40" y="310" width="1520" height="590" fill="url(#atmo-ground)" opacity={dawn ? 0.13 : 0.19} filter="url(#atmo-bloom)" />
        {/* faint terrain contours in the middle distance */}
        <path d="M-20,420 C300,404 700,432 1470,414" fill="none" stroke={lowDeep} strokeWidth="1" opacity="0.05" filter="url(#atmo-edge)" />
        <path d="M-20,560 C420,576 900,548 1470,566" fill="none" stroke="var(--orient)" strokeWidth="1" opacity="0.045" filter="url(#atmo-edge)" />
        {/* the horizon line itself */}
        <line x1="-20" y1="308" x2="1460" y2="306" stroke="var(--ink-soft)" strokeWidth="0.8" opacity="0.22" filter="url(#atmo-edge)" />
      </svg>

      {/* one quiet molecule in the upper sky, chosen by the page you're on */}
      <svg
        viewBox="-130 -150 300 230"
        width="300"
        height="230"
        className="atmo-breathe absolute"
        style={{
          top: "6%",
          right: seed % 2 ? "9%" : "auto",
          left: seed % 2 ? "auto" : "10%",
          stroke: "var(--orient-deep)",
          color: "var(--orient-deep)",
          opacity: 0.05,
          transform: `rotate(${(seed % 11) - 5}deg)`,
          fontFamily: '"Instrument Sans", sans-serif',
          fontSize: "11px",
        }}
      >
        <g strokeWidth="1.1" style={{ fill: "none" }}>
          {molecule.body}
        </g>
      </svg>

      {/* distant trichos on the horizon */}
      <svg
        viewBox="0 0 60 36"
        width="60"
        height="36"
        aria-hidden="true"
        className="absolute"
        style={{
          left: seed % 2 ? "24%" : "68%",
          top: "calc(34.2% - 33px)",
          stroke: "var(--ink-soft)",
          color: "var(--ink-soft)",
          opacity: 0.32,
        }}
      >
        <Tricho x={20} y={34} s={0.9} />
        <Tricho x={44} y={34} s={0.55} />
      </svg>

      <Botanicals
        className="absolute left-[3%]"
        style={{ top: "calc(34.5% - 118px)", opacity: 0.45 }}
        mirror={mirrorBotanicals}
      />
      <Botanicals
        className="absolute bottom-6 right-[4%] hidden sm:block"
        style={{ opacity: 0.75 }}
        mirror={!mirrorBotanicals}
      />
    </div>
  );
}
