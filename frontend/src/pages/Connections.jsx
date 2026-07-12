import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../lib/api";
import { temporalMeta } from "../lib/theme";
import { CalendarActions } from "../components/CalendarActions";

const STATUS = {
  approved: { label: "Connected", tone: "var(--orient-deep)", note: "Details are yours." },
  pending: { label: "Waiting", tone: "var(--clay)", note: "Waiting for the organizer to confirm." },
  declined: { label: "Not confirmed", tone: "var(--ink-soft)", note: "This request wasn't confirmed." },
};

export default function Connections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/rsvps/mine").then(({ data }) => { setItems(data.connections); setLoading(false); }).catch(() => setLoading(false)); }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="label text-orient-deep">Your connections</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 450 }}>Lines you've drawn.</h1>
      <p className="mt-5 text-ink-soft">Every circle you've asked to join, and where each request stands.</p>

      {loading ? <p className="mt-12 text-ink-soft">Loading…</p> : items.length === 0 ? (
        <p className="mt-12 text-ink-soft" data-testid="no-connections">No connections yet. <Link to="/" className="text-clay-deep underline underline-offset-4">Enter the field</Link> and find a circle.</p>
      ) : (
        <div className="mt-10 divide-y divide-line border-t border-line" data-testid="connections-list">
          {items.map((it, i) => {
            const s = STATUS[it.status] || STATUS.pending;
            const t = temporalMeta(it.meeting?.temporal);
            return (
              <div key={i} className="py-6" data-testid={`connection-${it.circle_slug}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to={`/circle/${it.circle_slug}`} className="font-display text-xl hover:text-clay" style={{ fontWeight: 470 }}>{it.circle_name}</Link>
                    <p className="mt-1 text-sm text-ink-soft">{it.meeting?.date_label} · {it.meeting?.time_label}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                      <MapPin size={13} strokeWidth={1.5} />
                      {it.status === "approved" && it.meeting?.exact_location ? it.meeting.exact_location : it.meeting?.general_location}
                    </p>
                  </div>
                  <span className="label whitespace-nowrap" style={{ color: s.tone }}>{s.label}</span>
                </div>
                <p className="mt-2 text-xs text-ink-soft/80">{s.note}</p>
                {it.status === "approved" && it.meeting && <div className="mt-3"><CalendarActions meetingId={it.meeting.id} compact /></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
