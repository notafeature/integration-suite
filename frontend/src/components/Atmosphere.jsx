import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// Site-wide high-desert atmosphere, anchored to the BOTTOM of the viewport
// (where the original footer band lived) and extending upward: ground and
// horizon low, layered mesas, a rising sky wash, a sun or moon, and chemical
// structures in the upper sky. Scene covers roughly the bottom two-thirds of
// the screen and stays legible behind content. The page path picks which
// molecule appears and which side things sit on; the local clock picks dawn
// (6:00–18:00) or dusk. All color comes from the palette variables.

// ---------- botanical + desert line art ----------

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

// Three mushrooms — domed caps over slender stems, gill ticks under the rim.
// Small and sheltering under the grasses, but unmistakable once seen.
function Mushrooms({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,0 C-0.6,-4 -0.6,-9 0.2,-12" fill="none" strokeWidth="0.55" />
      <path d="M-4.5,-12 C-4.5,-17.5 4.5,-17.5 4.5,-12 L-4.5,-12" fill="none" strokeWidth="0.55" />
      <line x1="-2.4" y1="-11.9" x2="-2.4" y2="-10.7" strokeWidth="0.3" />
      <line x1="0" y1="-11.9" x2="0" y2="-10.5" strokeWidth="0.3" />
      <line x1="2.4" y1="-11.9" x2="2.4" y2="-10.7" strokeWidth="0.3" />
      <path d="M7.5,0 C7.2,-2.5 7.2,-5 7.8,-7" fill="none" strokeWidth="0.5" />
      <path d="M4.5,-7 C4.5,-10.8 11,-10.8 11,-7 L4.5,-7" fill="none" strokeWidth="0.5" />
      <path d="M-6,0 C-6.2,-2 -6.2,-3.5 -6,-5" fill="none" strokeWidth="0.5" />
      <path d="M-8.5,-5 C-8.5,-7.6 -3.5,-7.6 -3.5,-5 L-8.5,-5" fill="none" strokeWidth="0.5" />
    </g>
  );
}

// A toad at rest: squat domed body, folded haunch, parotoid ridge, one eye.
function Toad({ x, y, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1,1)" : ""}`}>
      <path d="M-9,0 C-11,-4 -8,-8 -4,-9 C-2,-11.5 2,-11.5 4,-9.5 C8,-8.5 10,-4 8,-0.5 Z" fill="none" strokeWidth="0.55" />
      <path d="M3,0 C2,-4 6,-6 8,-3" fill="none" strokeWidth="0.45" />
      <line x1="-5" y1="0" x2="-5.6" y2="-3.2" strokeWidth="0.45" />
      <path d="M0,-10.6 C1.4,-10.9 2.6,-10.4 3.2,-9.6" fill="none" strokeWidth="0.4" />
      <circle cx="-2.6" cy="-10" r="0.6" fill="currentColor" stroke="none" />
    </g>
  );
}

// Distant columnar cacti for the horizon line.
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

// Foreground San Pedro stand: a tall ribbed column flanked by two shorter
// ones, areoles dotted along the ribs.
function SanPedro({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9,0 L-9,-76 C-9,-88 9,-88 9,-76 L9,0" fill="none" strokeWidth="0.9" />
      <line x1="-3" y1="0" x2="-3" y2="-82" strokeWidth="0.5" />
      <line x1="3" y1="0" x2="3" y2="-82" strokeWidth="0.5" />
      {[-70, -56, -42, -28, -14].map((yy) => (
        <g key={yy} fill="currentColor" stroke="none">
          <circle cx="-3" cy={yy} r="0.6" />
          <circle cx="3" cy={yy + 7} r="0.6" />
        </g>
      ))}
      <path d="M-26,0 L-26,-44 C-26,-54 -12,-54 -12,-44 L-12,0" fill="none" strokeWidth="0.8" />
      <line x1="-19" y1="0" x2="-19" y2="-48" strokeWidth="0.45" />
      <path d="M12,0 L12,-26 C12,-33 24,-33 24,-26 L24,0" fill="none" strokeWidth="0.7" />
      <line x1="18" y1="0" x2="18" y2="-29" strokeWidth="0.4" />
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
      <Mushrooms x={192} y={128} />
      <Toad x={124} y={127} flip />
    </svg>
  );
}

// ---------- molecules (skeletal formulas in the upper sky) ----------

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

function Molecule({ molecule, width, className, style }) {
  return (
    <svg
      viewBox="-130 -150 300 230"
      width={width}
      height={Math.round((width * 230) / 300)}
      aria-hidden="true"
      className={className}
      style={{
        stroke: "var(--orient-deep)",
        color: "var(--orient-deep)",
        fontFamily: '"Instrument Sans", sans-serif',
        fontSize: "12px",
        ...style,
      }}
    >
      <g className="atmo-breathe" strokeWidth="1.3" style={{ fill: "none" }}>
        {molecule.body}
      </g>
    </svg>
  );
}

// ---------- the layer ----------

const isDawn = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
};

// Horizon height inside the 1440x900 wash canvas: the scene's feet stay at
// the bottom of the viewport; sky extends upward from here.
const HORIZON = 700;

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
  const secondMolecule = MOLECULES[(seed + 1) % MOLECULES.length];
  const flipSides = seed % 2 === 1;

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
            <stop offset="0" stopColor={high} stopOpacity="0" />
            <stop offset="0.35" stopColor={high} stopOpacity="0.24" />
            <stop offset="0.8" stopColor={low} stopOpacity="0.42" />
            <stop offset="1" stopColor={low} stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id="atmo-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lowDeep} stopOpacity="0.5" />
            <stop offset="0.35" stopColor={lowDeep} stopOpacity="0.14" />
            <stop offset="1" stopColor={lowDeep} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* sky wash climbing from the horizon well past mid-screen */}
        <rect x="-40" y="150" width="1520" height={HORIZON - 150} fill="url(#atmo-sky)" opacity={dawn ? 0.2 : 0.28} filter="url(#atmo-bloom)" />
        {/* high thin wash near the top of the scene */}
        <rect x="-40" y="120" width="1520" height="130" fill={high} opacity={dawn ? 0.035 : 0.05} filter="url(#atmo-bloom)" />
        {/* far mesa range */}
        <path
          d={`M-40,${HORIZON - 4} L180,${HORIZON - 10} C320,${HORIZON - 40} 470,${HORIZON - 46} 580,${HORIZON - 24} L760,${HORIZON - 6} L1010,${HORIZON - 14} C1120,${HORIZON - 36} 1240,${HORIZON - 32} 1330,${HORIZON - 16} L1480,${HORIZON - 4} L1480,${HORIZON + 30} L-40,${HORIZON + 30} Z`}
          fill="var(--violet)"
          opacity={dawn ? 0.12 : 0.18}
          filter="url(#atmo-bloom)"
        />
        {/* near ridge, warmer and lower */}
        <path
          d={`M-40,${HORIZON + 8} L260,${HORIZON + 2} C420,${HORIZON - 12} 560,${HORIZON - 8} 700,${HORIZON + 4} L1480,${HORIZON + 10} L1480,${HORIZON + 44} L-40,${HORIZON + 44} Z`}
          fill={lowDeep}
          opacity="0.1"
          filter="url(#atmo-bloom)"
        />
        {/* ground down to the bottom edge */}
        <rect x="-40" y={HORIZON + 6} width="1520" height={900 - HORIZON + 40} fill="url(#atmo-ground)" opacity={dawn ? 0.2 : 0.26} filter="url(#atmo-bloom)" />
        {/* foreground contour lines */}
        <path d={`M-20,${HORIZON + 70} C300,${HORIZON + 56} 700,${HORIZON + 84} 1470,${HORIZON + 66}`} fill="none" stroke={lowDeep} strokeWidth="1.1" opacity="0.09" filter="url(#atmo-edge)" />
        <path d={`M-20,${HORIZON + 140} C420,${HORIZON + 152} 900,${HORIZON + 128} 1470,${HORIZON + 146}`} fill="none" stroke="var(--orient)" strokeWidth="1.1" opacity="0.08" filter="url(#atmo-edge)" />
        {/* the horizon line itself */}
        <line x1="-20" y1={HORIZON + 2} x2="1460" y2={HORIZON} stroke="var(--ink-soft)" strokeWidth="0.9" opacity="0.3" filter="url(#atmo-edge)" />
      </svg>

      {/* sun (dawn) or moon (dusk) */}
      {dawn ? (
        <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" className="absolute" style={{ right: flipSides ? "auto" : "13%", left: flipSides ? "12%" : "auto", top: "calc(77.7% - 128px)" }}>
          <defs>
            <filter id="atmo-sun-soft"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          <circle cx="60" cy="60" r="42" fill="var(--amber)" opacity="0.2" filter="url(#atmo-sun-soft)" />
          <circle cx="60" cy="60" r="30" fill="var(--amber)" opacity="0.16" filter="url(#atmo-sun-soft)" />
        </svg>
      ) : (
        <svg viewBox="0 0 90 90" width="90" height="90" aria-hidden="true" className="absolute" style={{ right: flipSides ? "auto" : "16%", left: flipSides ? "14%" : "auto", top: "17%" }}>
          <defs>
            <filter id="atmo-moon-soft"><feGaussianBlur stdDeviation="1.6" /></filter>
            <mask id="atmo-moon-bite">
              <rect width="90" height="90" fill="white" />
              <circle cx="54" cy="38" r="24" fill="black" />
            </mask>
          </defs>
          <circle cx="45" cy="45" r="26" fill="var(--violet-deep)" opacity="0.22" filter="url(#atmo-moon-soft)" mask="url(#atmo-moon-bite)" />
        </svg>
      )}

      {/* chemistry in the upper sky — visible if you look up */}
      <Molecule
        molecule={molecule}
        width={400}
        className="absolute"
        style={{ top: "7%", right: flipSides ? "auto" : "7%", left: flipSides ? "8%" : "auto", opacity: 0.11, transform: `rotate(${(seed % 11) - 5}deg)` }}
      />
      <Molecule
        molecule={secondMolecule}
        width={230}
        className="absolute hidden md:block"
        style={{ top: "30%", right: flipSides ? "10%" : "auto", left: flipSides ? "auto" : "6%", opacity: 0.075, transform: `rotate(${(seed % 9) - 4}deg)` }}
      />

      {/* distant trichos standing on the horizon */}
      <svg
        viewBox="0 0 60 36"
        width="78"
        height="47"
        aria-hidden="true"
        className="absolute"
        style={{
          left: flipSides ? "22%" : "64%",
          top: "calc(77.7% - 44px)",
          stroke: "var(--ink-soft)",
          color: "var(--ink-soft)",
          opacity: 0.45,
        }}
      >
        <Tricho x={20} y={34} s={0.9} />
        <Tricho x={44} y={34} s={0.55} />
      </svg>

      {/* foreground San Pedro stand */}
      <svg
        viewBox="0 0 120 130"
        width="120"
        height="130"
        aria-hidden="true"
        className="absolute bottom-1"
        style={{
          left: flipSides ? "6%" : "auto",
          right: flipSides ? "auto" : "18%",
          stroke: "var(--ink-soft)",
          color: "var(--ink-soft)",
          opacity: 0.5,
        }}
      >
        <SanPedro x={60} y={128} s={1.3} />
      </svg>

      <Botanicals
        className="absolute bottom-2 left-[2%]"
        style={{ opacity: 0.6 }}
        mirror={flipSides}
      />
      <Botanicals
        className="absolute bottom-6 right-[3%] hidden sm:block"
        style={{ opacity: 0.75 }}
        mirror={!flipSides}
      />
    </div>
  );
}
