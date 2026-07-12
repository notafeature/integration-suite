import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const TAGS = [
  { key: "", label: "All" },
  { key: "local", label: "Local" },
  { key: "national", label: "National" },
  { key: "online", label: "Online" },
];
const TAG_TONE = { local: "var(--clay)", national: "var(--violet-deep)", online: "var(--orient-deep)" };

function SuggestForm({ onDone }) {
  const [form, setForm] = useState({ name: "", category: "practitioner", summary: "", url: "", tag: "local", city: "", state: "NM" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post("/resources", form); setDone(true); onDone?.(); } catch { /* */ } finally { setBusy(false); }
  };
  if (done) return <p className="border border-orient/40 bg-orient/5 p-4 text-sm" data-testid="suggest-done">Thank you — your submission is in the moderation queue and will be reviewed before it appears.</p>;
  return (
    <form onSubmit={submit} className="grid gap-3 border border-line bg-white/60 p-5 sm:grid-cols-2" data-testid="suggest-form">
      <label className="flex flex-col gap-1 sm:col-span-2"><span className="label text-ink-soft">Name</span>
        <input required value={form.name} onChange={set("name")} data-testid="suggest-name" className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Type</span>
        <select value={form.category} onChange={set("category")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient">
          <option value="practitioner">Practitioner</option><option value="organization">Organization</option><option value="resource">Resource</option>
        </select></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Reach</span>
        <select value={form.tag} onChange={set("tag")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient">
          <option value="local">Local</option><option value="national">National</option><option value="online">Online</option>
        </select></label>
      <label className="flex flex-col gap-1 sm:col-span-2"><span className="label text-ink-soft">Summary</span>
        <input value={form.summary} onChange={set("summary")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">City (if local)</span>
        <input value={form.city} onChange={set("city")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Link (optional)</span>
        <input value={form.url} onChange={set("url")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <div className="sm:col-span-2">
        <button disabled={busy} data-testid="suggest-submit" className="bg-clay px-5 py-2.5 text-sm font-medium text-canvas hover:bg-clay-deep disabled:opacity-60">
          {busy ? "Submitting…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

export default function Directory() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [tag, setTag] = useState(params.get("tag") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const [resources, setResources] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const load = useCallback(async () => {
    const p = {};
    if (tag) p.tag = tag;
    if (q) p.q = q;
    const { data } = await api.get("/resources", { params: p });
    setResources(data.resources);
  }, [tag, q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const np = {}; if (tag) np.tag = tag; if (q) np.q = q; setParams(np, { replace: true }); }, [tag, q, setParams]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <p className="label text-orient-deep">Trusted resources</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 450 }}>The wider field.</h1>
      <p className="mt-5 max-w-xl text-ink-soft">
        Practitioners, organizations, and integration resources — tagged by reach. Every listing is reviewed before it appears.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {TAGS.map((t) => (
          <button key={t.key} onClick={() => setTag(t.key)} data-testid={`tag-${t.label.toLowerCase()}`}
            className={`label border px-4 py-2 transition-colors ${tag === t.key ? "border-ink bg-ink text-canvas" : "border-line text-ink-soft hover:border-ink"}`}>
            {t.label}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources" data-testid="resource-search"
          className="ml-auto border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-orient" />
      </div>

      <div className="mt-10 divide-y divide-line border-t border-line" data-testid="resource-list">
        {resources.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 py-5">
            <div>
              <a href={r.url || undefined} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5">
                <span className="font-display text-xl group-hover:text-orient-deep" style={{ fontWeight: 470 }}>{r.name}</span>
                {r.url && <ArrowUpRight size={14} className="text-ink-soft" />}
              </a>
              <p className="mt-1 max-w-xl text-sm text-ink-soft">{r.summary}</p>
              <p className="mt-1 text-xs text-ink-soft/70 capitalize">{r.category}{r.city ? ` · ${r.city}` : ""}</p>
            </div>
            <span className="label whitespace-nowrap" style={{ color: TAG_TONE[r.tag] }}>{r.tag}</span>
          </div>
        ))}
        {resources.length === 0 && <p className="py-10 text-ink-soft">No resources match yet.</p>}
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xl" style={{ fontWeight: 470 }}>Know a trusted resource?</p>
            <p className="text-sm text-ink-soft">Submissions are reviewed before they're listed.</p>
          </div>
          {user ? (
            <button onClick={() => setShowSuggest((v) => !v)} data-testid="toggle-suggest"
              className="inline-flex items-center gap-1.5 border border-ink/25 px-4 py-2 text-sm hover:border-clay hover:text-clay">
              <Plus size={15} /> Suggest a resource
            </button>
          ) : (
            <a href="/login" className="label text-clay-deep">Sign in to suggest →</a>
          )}
        </div>
        {showSuggest && user && <div className="mt-6"><SuggestForm onDone={load} /></div>}
      </div>
    </div>
  );
}
