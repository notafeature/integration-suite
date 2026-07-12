import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useConfig } from "../context/ConfigContext";

const AGREEMENT_STARTERS = [
  "What's shared in the circle stays in the circle.",
  "Speak from your own experience; no advising for others.",
  "Arrive sober. This is integration space, not journey space.",
  "No sourcing, referrals, or facilitation talk — ever.",
];

export default function StartCircle() {
  const navigate = useNavigate();
  const { formats } = useConfig();
  const [form, setForm] = useState({
    name: "", city: "Santa Fe", state: "NM", kind: "local", format: "sharing-circle",
    cadence: "", capacity: 12, summary: "", description: "", host_name: "", host_note: "",
    agreements: AGREEMENT_STARTERS.join("\n"),
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const payload = {
        ...form, capacity: Number(form.capacity),
        description: form.description.split("\n").map((s) => s.trim()).filter(Boolean),
        agreements: form.agreements.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.post("/circles", payload);
      navigate(`/circle/${data.slug}`);
    } catch (e2) { setErr(e2?.response?.data?.detail || "Could not create circle."); }
    finally { setBusy(false); }
  };

  const fmtEntries = Object.entries(formats || { "sharing-circle": "Sharing circle" });

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="label text-clay-deep">Start a circle</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 450 }}>Put your circle on the field.</h1>
      <p className="mt-5 text-ink-soft">
        Already holding space? List your circle so people nearby can find and request to join it. You approve every attendee, and exact locations stay private until you do.
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-5 sm:grid-cols-2" data-testid="start-circle-form">
        <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="label text-ink-soft">Circle name</span>
          <input required value={form.name} onChange={set("name")} data-testid="circle-name" className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">City</span>
          <input required value={form.city} onChange={set("city")} data-testid="circle-city" className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>
        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">Kind</span>
          <select value={form.kind} onChange={set("kind")} className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient">
            <option value="local">In-person (local)</option><option value="online">Online</option>
          </select></label>

        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">Format</span>
          <select value={form.format} onChange={set("format")} data-testid="circle-format" className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient">
            {fmtEntries.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></label>
        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">Cadence</span>
          <input value={form.cadence} onChange={set("cadence")} placeholder="Twice monthly · Tuesdays" className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="label text-ink-soft">One-line summary</span>
          <input value={form.summary} onChange={set("summary")} data-testid="circle-summary" className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="label text-ink-soft">Description (one paragraph per line)</span>
          <textarea rows={3} value={form.description} onChange={set("description")} className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">Host name</span>
          <input value={form.host_name} onChange={set("host_name")} className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>
        <label className="flex flex-col gap-1.5"><span className="label text-ink-soft">About the host</span>
          <input value={form.host_note} onChange={set("host_note")} className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        <label className="flex flex-col gap-1.5 sm:col-span-2"><span className="label text-ink-soft">Agreements (one per line)</span>
          <textarea rows={4} value={form.agreements} onChange={set("agreements")} className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" /></label>

        {err && <p className="text-sm text-clay sm:col-span-2" data-testid="start-error">{err}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} data-testid="circle-submit" className="bg-clay px-6 py-3 text-sm font-medium text-canvas hover:bg-clay-deep disabled:opacity-60">
            {busy ? "Creating…" : "Create circle"}
          </button>
        </div>
      </form>
    </div>
  );
}
