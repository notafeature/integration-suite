import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Search, Clock, Repeat, User, ArrowUpRight } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { temporalMeta } from "../lib/theme";
import { CalendarActions } from "../components/CalendarActions";

const EASE = [0.22, 0.61, 0.36, 1];
const FIELD_POS = [
  { x: 60, y: 40 }, { x: 44, y: 64 }, { x: 75, y: 26 },
  { x: 58, y: 81 }, { x: 86, y: 55 }, { x: 37, y: 33 },
];

function ringColor(t) {
  const m = temporalMeta(t);
  return m ? m.ring : "#7C8AA0";
}

/* ============================ desktop spatial field ============================ */
function SpatialField({ field, onOpenLocation, onOpenCircle }) {
  const { params, level, locationData, circleData, activeLocation, activeCircle, back, requestJoin, joining } = field;
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 1000, h: 640 });
  const [cursor, setCursor] = useState(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const px = useCallback((p) => ({ left: (p.x / 100) * size.w, top: (p.y / 100) * size.h }), [size]);
  const attn = useCallback((p) => {
    if (!cursor) return 0;
    const c = px(p);
    const d = Math.hypot(cursor.x - c.left, cursor.y - c.top);
    return Math.max(0, Math.min(1, 1 - d / 300));
  }, [cursor, px]);

  const locations = field.field?.locations || [];

  // circle ring layout for the active location
  const circles = locationData?.circles || [];
  const centerPct = level === "circle" ? { x: 33, y: 48 } : { x: 52, y: 50 };
  const circlePos = useMemo(() => {
    const n = Math.max(circles.length, 1);
    const start = -145, span = Math.min(300, 70 * n);
    const step = n > 1 ? span / (n - 1) : 0;
    return circles.map((c, i) => {
      const a = ((start + i * step) * Math.PI) / 180;
      return { slug: c.slug, x: centerPct.x + 30 * Math.cos(a), y: centerPct.y + 27 * Math.sin(a) };
    });
  }, [circles, centerPct.x, centerPct.y]);

  const activeCirclePx = px(centerPct);
  const youPct = { x: 13, y: 86 };
  const nextMeeting = circleData?.meetings?.[0];
  const rsvpStatus = nextMeeting?.my_rsvp;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      onMouseMove={(e) => { const r = wrapRef.current.getBoundingClientRect(); setCursor({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      onMouseLeave={() => setCursor(null)}
      data-testid="spatial-field"
    >
      {/* connection lines */}
      <svg className="pointer-events-none absolute inset-0" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
        {level === "field" && locations.map((loc, i) => {
          const online = locations.find((l) => l.kind === "online");
          if (!online || loc.kind === "online") return null;
          const a = px(FIELD_POS[i % FIELD_POS.length]);
          const b = px(FIELD_POS[locations.indexOf(online) % FIELD_POS.length]);
          const op = 0.05 + 0.35 * Math.max(attn(FIELD_POS[i % FIELD_POS.length]), attn(FIELD_POS[locations.indexOf(online) % FIELD_POS.length]));
          return <line key={loc.id} x1={a.left} y1={a.top} x2={b.left} y2={b.top} stroke="#B9B3A4" strokeWidth="1" opacity={op} />;
        })}
        {(level === "location" || level === "circle") && circlePos.map((cp, i) => {
          const c = px(centerPct); const p = px(cp);
          const faded = level === "circle" && circles[i]?.slug !== activeCircle;
          return <line key={cp.slug} x1={c.left} y1={c.top} x2={p.left} y2={p.top} stroke={ringColor(circles[i]?.temporal)} strokeWidth="1" opacity={faded ? 0.04 : 0.28} />;
        })}
        {level === "circle" && rsvpStatus && (() => {
          const you = px(youPct); const c = activeCirclePx;
          const frac = rsvpStatus === "approved" ? 1 : 0.66;
          const ex = you.left + (c.left - you.left) * frac;
          const ey = you.top + (c.top - you.top) * frac;
          return (
            <g>
              <motion.line x1={you.left} y1={you.top} x2={ex} y2={ey}
                stroke="#A8542F" strokeWidth="1.6"
                strokeDasharray={rsvpStatus === "approved" ? "0" : "5 5"}
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: rsvpStatus === "approved" ? 0.85 : 0.5 }}
                transition={{ duration: 1, ease: EASE }} />
              <circle cx={you.left} cy={you.top} r="4" fill="#A8542F" />
            </g>
          );
        })()}
      </svg>

      {level === "circle" && (
        <div className="absolute left-[13%] top-[86%] -translate-x-1/2 translate-y-4 text-center" data-testid="you-marker">
          <span className="label text-clay">You</span>
        </div>
      )}

      {/* location nodes */}
      {locations.map((loc, i) => {
        const base = FIELD_POS[i % FIELD_POS.length];
        const isActive = activeLocation === loc.label;
        let target = base, opacity = 1, scale = 1;
        if (level !== "field") {
          if (isActive) { target = { x: centerPct.x, y: level === "circle" ? centerPct.y - 34 : centerPct.y - 36 }; opacity = 0.5; scale = 0.7; }
          else { target = { x: base.x < 50 ? 6 : 94, y: base.y }; opacity = 0.1; scale = 0.5; }
        }
        const a = attn(base);
        const rBase = 42 + Math.min(loc.group_count, 8) * 3;
        const p = px(target);
        const tone = ringColor(loc.temporal);
        return (
          <motion.button
            key={loc.id}
            data-testid={`location-node-${loc.id}`}
            onClick={() => level === "field" && onOpenLocation(loc.label)}
            initial={false}
            animate={{ left: p.left, top: p.top, opacity, scale }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ pointerEvents: level === "field" ? "auto" : "none" }}
          >
            <span className="relative flex items-center justify-center rounded-full"
              style={{ width: rBase * 2, height: rBase * 2 }}>
              <span className={`absolute inset-0 rounded-full border ${loc.temporal === "imminent" ? "breathe" : ""}`}
                style={{ borderColor: tone, opacity: level === "field" ? 0.35 + a * 0.55 : 0.5 }} />
              {level === "field" && a > 0.15 && (
                <span className="absolute inset-[6px] rounded-full" style={{ background: tone, opacity: a * 0.05 }} />
              )}
              <span className="flex flex-col items-center text-center">
                <span className="font-display leading-none" style={{ fontWeight: 480, fontSize: 18 - (level !== "field" ? 3 : 0), opacity: level === "field" ? 0.35 + a * 0.65 : 0.7 }}>
                  {loc.label}
                </span>
                <span className="mt-1 text-[11px] text-ink-soft" style={{ opacity: level === "field" ? 0.25 + a * 0.7 : 0.6 }}>
                  {loc.group_count} {loc.group_count === 1 ? "circle" : "circles"}
                </span>
                {level === "field" && temporalMeta(loc.temporal) && a > 0.35 && (
                  <span className="label mt-1" style={{ color: temporalMeta(loc.temporal).tone, fontSize: 9 }}>
                    {temporalMeta(loc.temporal).label}
                  </span>
                )}
              </span>
            </span>
          </motion.button>
        );
      })}

      {/* circle nodes (location + circle levels) */}
      {(level === "location" || level === "circle") && circles.map((c, i) => {
        const pos = circlePos[i];
        const a = attn(pos);
        const isActive = c.slug === activeCircle;
        const p = level === "circle" && isActive ? activeCirclePx : px(pos);
        const opacity = level === "circle" && !isActive ? 0.08 : 1;
        const scale = level === "circle" && isActive ? 1.35 : 1;
        const tone = ringColor(c.temporal);
        const r = 40;
        return (
          <motion.button
            key={c.slug}
            data-testid={`circle-node-${c.slug}`}
            onClick={() => onOpenCircle(c.slug)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ left: p.left, top: p.top, opacity, scale }}
            transition={{ duration: 0.85, ease: EASE, delay: level === "location" ? i * 0.06 : 0 }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ pointerEvents: opacity < 0.2 ? "none" : "auto" }}
          >
            <span className="relative flex items-center justify-center rounded-full" style={{ width: r * 2, height: r * 2 }}>
              <span className={`absolute inset-0 rounded-full border ${c.temporal === "imminent" ? "breathe" : ""}`}
                style={{ borderColor: tone, opacity: 0.4 + a * 0.5 }} />
              <span className="absolute inset-[7px] rounded-full" style={{ background: tone, opacity: 0.04 + a * 0.06 }} />
              <span className="max-w-[112px] px-2 text-center font-display leading-tight" style={{ fontWeight: 470, fontSize: 14, opacity: 0.55 + a * 0.45 }}>
                {c.name}
              </span>
            </span>
          </motion.button>
        );
      })}

      {/* context panel */}
      <AnimatePresence>
        {level === "circle" && circleData && (
          <motion.aside
            key={circleData.slug}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="thin-scroll absolute right-0 top-0 h-full w-full max-w-[440px] overflow-y-auto border-l border-line bg-panel/70 p-7 backdrop-blur-md sm:p-9"
            data-testid="circle-panel"
          >
            <CirclePanelContent detail={circleData} rsvpStatus={rsvpStatus} nextMeeting={nextMeeting}
              onRequest={requestJoin} joining={joining} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================ circle context panel ============================ */
function CirclePanelContent({ detail, rsvpStatus, nextMeeting, onRequest, joining }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const nm = nextMeeting;
  const t = nm && temporalMeta(nm.temporal);
  return (
    <div>
      <p className="label" style={{ color: "var(--orient-deep)" }}>
        <MapPin size={11} className="mr-1 inline" /> {detail.city}{detail.state ? `, ${detail.state}` : ""} · {detail.format_label}
      </p>
      <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight" style={{ fontWeight: 470 }} data-testid="panel-circle-name">{detail.name}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{detail.summary}</p>

      {/* next meeting — closest, warm */}
      {nm ? (
        <div className="mt-7 border-l-2 pl-4" style={{ borderColor: t ? t.ring : "var(--orient)" }} data-testid="panel-next-meeting">
          <p className="label" style={{ color: t ? t.tone : "var(--orient-deep)" }}>{t ? t.label : "Next gathering"}</p>
          <p className="mt-1.5 font-display text-lg" style={{ fontWeight: 480 }}>{nm.date_label}</p>
          <p className="text-sm text-ink-soft">{nm.time_label}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin size={13} strokeWidth={1.5} />
            {rsvpStatus === "approved" && nm.exact_location ? nm.exact_location : nm.general_location}
          </p>
          {rsvpStatus !== "approved" && <p className="mt-1 text-xs text-ink-soft/70">Exact location shared with approved members.</p>}

          {/* RSVP as connection */}
          <div className="mt-5">
            {!user ? (
              <button onClick={() => navigate("/login")} data-testid="rsvp-signin"
                className="w-full bg-clay py-3 text-sm font-medium text-canvas transition-colors hover:bg-clay-deep">
                Sign in to request a seat
              </button>
            ) : rsvpStatus === "approved" ? (
              <div className="border border-orient/40 bg-orient/5 p-3 text-sm" data-testid="rsvp-approved">
                <span className="font-medium" style={{ color: "var(--orient-deep)" }}>You're connected.</span>
                <span className="text-ink-soft"> The details above are yours.</span>
              </div>
            ) : rsvpStatus === "pending" ? (
              <div className="border border-dashed border-clay/50 p-3 text-sm" data-testid="rsvp-pending">
                <span className="font-medium text-clay-deep">Request sent.</span>
                <span className="text-ink-soft"> Waiting for the organizer to confirm — the connection completes when they approve.</span>
              </div>
            ) : rsvpStatus === "declined" ? (
              <div className="border border-line p-3 text-sm text-ink-soft" data-testid="rsvp-declined">
                This request wasn't confirmed. You're welcome to request another gathering.
              </div>
            ) : (
              <button onClick={() => onRequest(nm.id)} disabled={joining} data-testid="rsvp-request-btn"
                className="w-full bg-clay py-3 text-sm font-medium text-canvas transition-colors hover:bg-clay-deep disabled:opacity-60">
                {joining ? "Reaching out…" : "Request to join this circle"}
              </button>
            )}
          </div>

          {(rsvpStatus === "approved" || detail.is_organizer) && (
            <div className="mt-4"><CalendarActions meetingId={nm.id} compact /></div>
          )}
        </div>
      ) : (
        <p className="mt-7 text-sm text-ink-soft">No gathering scheduled yet. Check back soon.</p>
      )}

      {/* cadence + organizer */}
      <div className="mt-8 grid grid-cols-2 gap-5 border-t border-line pt-6 text-sm">
        <div>
          <p className="label flex items-center gap-1.5 text-ink-soft"><Repeat size={11} /> Cadence</p>
          <p className="mt-1.5">{detail.cadence || "—"}</p>
        </div>
        <div>
          <p className="label flex items-center gap-1.5 text-ink-soft"><Clock size={11} /> Format</p>
          <p className="mt-1.5">{detail.format_label}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <p className="label flex items-center gap-1.5 text-ink-soft"><User size={11} /> Held by</p>
        <p className="mt-1.5 font-display text-lg" style={{ fontWeight: 470 }}>{detail.organizer?.name}</p>
        {detail.organizer?.note && <p className="mt-1 text-sm text-ink-soft">{detail.organizer.note}</p>}
      </div>

      {/* description — reflection tone */}
      {detail.description?.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          {detail.description.map((d, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-ink-soft first:mt-0">{d}</p>)}
        </div>
      )}

      {/* agreements */}
      {detail.agreements?.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="label text-violet-deep">The agreements</p>
          <ul className="mt-3 space-y-2">
            {detail.agreements.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-soft"><span style={{ color: "var(--violet)" }}>—</span>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* resources emerge farther out */}
      {detail.resources?.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="label text-orient-deep">Nearby resources</p>
          <div className="mt-3 space-y-3">
            {detail.resources.slice(0, 4).map((r) => (
              <a key={r.id} href={r.url || undefined} target="_blank" rel="noreferrer" className="block group">
                <p className="text-sm font-medium group-hover:text-orient-deep">{r.name} {r.url && <ArrowUpRight size={12} className="inline" />}</p>
                <p className="text-xs text-ink-soft">{r.summary} <span className="label ml-1" style={{ fontSize: 9, color: "var(--orient-deep)" }}>{r.tag}</span></p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ compact (mobile) ============================ */
function CompactView(f) {
  const { level, field, locationData, circleData, activeLocation, requestJoin, joining, onOpenLocation, onOpenCircle } = f;
  if (level === "field") {
    return (
      <div className="space-y-3" data-testid="compact-locations">
        {field?.locations?.map((loc) => {
          const t = temporalMeta(loc.temporal);
          return (
            <button key={loc.id} onClick={() => onOpenLocation(loc.label)} data-testid={`location-node-${loc.id}`}
              className="flex w-full items-center justify-between border border-line bg-white/60 p-4 text-left transition-colors hover:border-orient">
              <span>
                <span className="font-display text-xl" style={{ fontWeight: 470 }}>{loc.label}</span>
                <span className="ml-2 text-sm text-ink-soft">{loc.group_count} circles</span>
              </span>
              {t && <span className="label" style={{ color: t.tone }}>{t.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }
  if (level === "location") {
    return (
      <div className="space-y-3" data-testid="compact-circles">
        {locationData?.circles?.map((c) => {
          const t = temporalMeta(c.temporal);
          return (
            <button key={c.slug} onClick={() => onOpenCircle(c.slug)} data-testid={`circle-node-${c.slug}`}
              className="block w-full border-l-2 bg-white/60 p-4 text-left" style={{ borderColor: t ? t.ring : "var(--line)" }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg" style={{ fontWeight: 470 }}>{c.name}</span>
                {t && <span className="label" style={{ color: t.tone }}>{t.label}</span>}
              </div>
              <p className="mt-1 text-sm text-ink-soft">{c.summary}</p>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="border border-line bg-white/60 p-5" data-testid="circle-panel">
      <CirclePanelContent detail={circleData} rsvpStatus={circleData?.meetings?.[0]?.my_rsvp}
        nextMeeting={circleData?.meetings?.[0]} onRequest={requestJoin} joining={joining} />
    </div>
  );
}

/* ============================ page ============================ */
export default function Home() {
  const routeParams = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brand, region } = useConfig();

  const [field, setField] = useState(null);
  const [level, setLevel] = useState("field");
  const [activeLocation, setActiveLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [activeCircle, setActiveCircle] = useState(null);
  const [circleData, setCircleData] = useState(null);
  const [joining, setJoining] = useState(false);
  const [query, setQuery] = useState("");
  const [isCompact, setIsCompact] = useState(typeof window !== "undefined" && window.innerWidth < 820);

  useEffect(() => {
    const onR = () => setIsCompact(window.innerWidth < 820);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => { api.get("/field").then(({ data }) => setField(data)).catch(() => {}); }, []);

  const openLocation = useCallback(async (label) => {
    setActiveLocation(label); setActiveCircle(null); setCircleData(null);
    const { data } = await api.get(`/locations/${encodeURIComponent(label)}`);
    setLocationData(data); setLevel("location");
    navigate(`/place/${encodeURIComponent(label)}`, { replace: true });
  }, [navigate]);

  const openCircle = useCallback(async (slug) => {
    const { data } = await api.get(`/circles/${slug}`);
    setCircleData(data); setActiveCircle(slug);
    if (!locationData || activeLocation !== (data.kind === "online" ? "Online" : data.city)) {
      const label = data.kind === "online" ? "Online" : data.city;
      setActiveLocation(label);
      const loc = await api.get(`/locations/${encodeURIComponent(label)}`);
      setLocationData(loc.data);
    }
    setLevel("circle");
    navigate(`/circle/${slug}`, { replace: true });
  }, [navigate, locationData, activeLocation]);

  // deep-link handling
  useEffect(() => {
    if (!field) return;
    if (routeParams.slug && activeCircle !== routeParams.slug) openCircle(routeParams.slug);
    else if (routeParams.label && activeLocation !== routeParams.label && !routeParams.slug) openLocation(routeParams.label);
    // eslint-disable-next-line
  }, [field]);

  const back = useCallback(() => {
    if (level === "circle") { setLevel("location"); setActiveCircle(null); setCircleData(null); navigate(`/place/${encodeURIComponent(activeLocation)}`, { replace: true }); }
    else if (level === "location") { setLevel("field"); setActiveLocation(null); setLocationData(null); navigate("/", { replace: true }); }
  }, [level, activeLocation, navigate]);

  const requestJoin = useCallback(async (meetingId) => {
    if (!user) { navigate("/login"); return; }
    setJoining(true);
    try {
      await api.post(`/meetings/${meetingId}/rsvp`);
      const { data } = await api.get(`/circles/${activeCircle}`);
      setCircleData(data);
    } catch { /* ignore */ } finally { setJoining(false); }
  }, [user, activeCircle, navigate]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const match = field?.locations?.find((l) => l.label.toLowerCase() === q.toLowerCase());
    if (match) openLocation(match.label);
    else navigate(`/directory?q=${encodeURIComponent(q)}`);
  };

  const fieldProps = { field, level, locationData, circleData, activeLocation, activeCircle, back, requestJoin, joining, params: routeParams,
    onOpenLocation: openLocation, onOpenCircle: openCircle };

  return (
    <div className="relative">
      {/* breadcrumb */}
      {level !== "field" && (
        <div className="absolute left-5 top-4 z-30 sm:left-8" data-testid="breadcrumb">
          <button onClick={back} className="label flex items-center gap-1 text-ink-soft hover:text-ink" data-testid="breadcrumb-back">
            <ChevronLeft size={13} /> {level === "circle" ? activeLocation : "The field"}
          </button>
        </div>
      )}

      <section className="relative" style={{ minHeight: "calc(100vh - 122px)" }}>
        <div className={`mx-auto grid h-full max-w-[1400px] px-5 sm:px-8 ${level === "field" && !isCompact ? "lg:grid-cols-[minmax(300px,34%)_1fr]" : "grid-cols-1"}`}>
          {/* editorial hero — field level only */}
          <AnimatePresence>
            {level === "field" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex flex-col justify-center py-14 lg:py-0 lg:pr-8"
              >
                <p className="label text-orient-deep">{region?.label} · and growing</p>
                <h1 className="mt-6 font-display text-5xl leading-[1.03] tracking-tight sm:text-6xl" style={{ fontWeight: 450 }}>
                  Find the circle<br />you can <em style={{ color: "var(--clay)", fontWeight: 400 }}>enter.</em>
                </h1>
                <p className="mt-7 max-w-md leading-relaxed text-ink-soft">
                  Small, steady, in-person groups for making sense of a psychedelic experience after it ends.
                  Move toward a place. Let a circle come into view. Ask to join.
                </p>

                <form onSubmit={onSearch} className="mt-9 flex max-w-md items-center border border-line bg-white/70 focus-within:border-orient" data-testid="field-search-form">
                  <Search size={16} className="ml-3.5 text-ink-soft" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} data-testid="search-input"
                    placeholder="Find a circle by city — e.g. Santa Fe"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none" />
                </form>
                <button onClick={() => openLocation(region?.defaultCity || "Santa Fe")} data-testid="use-location-btn"
                  className="mt-4 flex items-center gap-2 text-sm text-orient-deep hover:text-ink">
                  <MapPin size={14} strokeWidth={1.5} /> Start where you are — {region?.defaultCity}
                </button>

                <p className="mt-10 max-w-md text-xs leading-relaxed text-ink-soft/70">
                  Integration only. This is never a source of access to any substance. A place to land after — not before.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* the field itself */}
          <div className="relative">
            {level !== "field" && (
              <div className="pt-16 sm:pt-14" />
            )}
            {isCompact ? (
              <div className="py-6">
                {level !== "field" && (
                  <p className="mb-4 font-display text-2xl" style={{ fontWeight: 460 }}>
                    {level === "circle" ? circleData?.name : activeLocation}
                  </p>
                )}
                {field ? <CompactView {...fieldProps} /> : <p className="text-ink-soft">Orienting…</p>}
              </div>
            ) : (
              <div className="absolute inset-0">
                {field ? <SpatialField field={fieldProps} onOpenLocation={openLocation} onOpenCircle={openCircle} /> : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
