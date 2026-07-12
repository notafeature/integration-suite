import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Check, X, Plus, CalendarPlus } from "lucide-react";
import api from "../lib/api";
import { temporalMeta } from "../lib/theme";

function ScheduleForm({ slug, onDone }) {
  const [form, setForm] = useState({ start: "", general_location: "", exact_location: "", capacity: 12 });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.start) return;
    setBusy(true);
    const start = new Date(form.start);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    try {
      await api.post(`/circles/${slug}/meetings`, {
        start_at: start.toISOString(), end_at: end.toISOString(),
        general_location: form.general_location, exact_location: form.exact_location,
        capacity: Number(form.capacity),
      });
      onDone?.();
    } catch { /* */ } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 border border-line bg-white/60 p-4 sm:grid-cols-2" data-testid="schedule-form">
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Date & time</span>
        <input type="datetime-local" required value={form.start} onChange={set("start")} data-testid="meeting-datetime" className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Capacity</span>
        <input type="number" min="1" value={form.capacity} onChange={set("capacity")} className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">General location (public)</span>
        <input value={form.general_location} onChange={set("general_location")} data-testid="meeting-general-loc" placeholder="Railyard district, Santa Fe" className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <label className="flex flex-col gap-1"><span className="label text-ink-soft">Exact location (approved only)</span>
        <input value={form.exact_location} onChange={set("exact_location")} placeholder="Full address" className="border border-line px-3 py-2 text-sm outline-none focus:border-orient" /></label>
      <div className="sm:col-span-2">
        <button disabled={busy} data-testid="meeting-submit" className="bg-clay px-5 py-2.5 text-sm font-medium text-canvas hover:bg-clay-deep disabled:opacity-60">
          {busy ? "Scheduling…" : "Schedule meeting"}
        </button>
      </div>
    </form>
  );
}

export default function Organize() {
  const [circles, setCircles] = useState([]);
  const [requests, setRequests] = useState({});
  const [openSchedule, setOpenSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.get("/organize/circles");
    setCircles(data.circles);
    const reqs = {};
    await Promise.all(data.circles.map(async (c) => {
      const r = await api.get(`/circles/${c.slug}/rsvps`);
      reqs[c.slug] = r.data.requests;
    }));
    setRequests(reqs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, approve) => {
    await api.post(`/rsvps/${id}/${approve ? "approve" : "decline"}`);
    load();
  };

  if (loading) return <div className="mx-auto max-w-5xl px-5 py-20 font-display text-ink-soft">Loading your circles…</div>;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="label text-clay-deep">For circle-keepers</p>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 450 }}>Hold the space.</h1>
        </div>
        <Link to="/start" data-testid="new-circle-btn" className="inline-flex items-center gap-1.5 bg-clay px-5 py-2.5 text-sm font-medium text-canvas hover:bg-clay-deep">
          <Plus size={15} /> New circle
        </Link>
      </div>

      {circles.length === 0 && (
        <p className="mt-12 text-ink-soft" data-testid="no-circles">You aren't hosting any circles yet. <Link to="/start" className="text-clay-deep underline underline-offset-4">Start one</Link>.</p>
      )}

      <div className="mt-10 space-y-10">
        {circles.map((c) => {
          const reqs = requests[c.slug] || [];
          const pending = reqs.filter((r) => r.status === "pending");
          return (
            <div key={c.slug} className="border-t border-line pt-6" data-testid={`organize-circle-${c.slug}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link to={`/circle/${c.slug}`} className="font-display text-2xl hover:text-clay" style={{ fontWeight: 470 }}>{c.name}</Link>
                  <p className="text-sm text-ink-soft">{c.city} · {c.format_label} · {c.cadence}</p>
                </div>
                {c.pending_count > 0 && <span className="label bg-clay/10 px-3 py-1 text-clay-deep">{c.pending_count} awaiting you</span>}
              </div>

              {/* requests */}
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="label text-ink-soft">Requests to join</p>
                  <div className="mt-3 space-y-2" data-testid={`requests-${c.slug}`}>
                    {reqs.length === 0 && <p className="text-sm text-ink-soft/70">No requests yet.</p>}
                    {reqs.map((r) => (
                      <div key={r.id} className="flex items-center justify-between border border-line bg-white/60 px-3 py-2.5 text-sm">
                        <div>
                          <p className="font-medium">{r.user_name}</p>
                          <p className="text-xs text-ink-soft">{r.meeting?.date_label} · <span className="capitalize" style={{ color: r.status === "approved" ? "var(--orient-deep)" : r.status === "declined" ? "var(--ink-soft)" : "var(--clay)" }}>{r.status}</span></p>
                        </div>
                        {r.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => decide(r.id, true)} data-testid={`approve-${r.id}`} title="Approve" className="border border-orient/40 p-1.5 text-orient-deep hover:bg-orient/10"><Check size={15} /></button>
                            <button onClick={() => decide(r.id, false)} data-testid={`decline-${r.id}`} title="Decline" className="border border-line p-1.5 text-ink-soft hover:bg-panel"><X size={15} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* meetings */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="label text-ink-soft">Meetings</p>
                    <button onClick={() => setOpenSchedule(openSchedule === c.slug ? null : c.slug)} data-testid={`schedule-toggle-${c.slug}`}
                      className="label inline-flex items-center gap-1 text-clay-deep hover:text-clay"><CalendarPlus size={13} /> Schedule</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(c.meetings || []).map((m) => {
                      const t = temporalMeta(m.temporal);
                      return (
                        <div key={m.id} className="border-l-2 bg-white/60 px-3 py-2 text-sm" style={{ borderColor: t ? t.ring : "var(--line)" }}>
                          <p className="font-medium">{m.date_label}</p>
                          <p className="text-xs text-ink-soft">{m.time_label} · {m.seats_left}/{m.capacity} seats</p>
                        </div>
                      );
                    })}
                    {(c.meetings || []).length === 0 && <p className="text-sm text-ink-soft/70">No upcoming meetings.</p>}
                  </div>
                  {openSchedule === c.slug && <ScheduleForm slug={c.slug} onDone={() => { setOpenSchedule(null); load(); }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
