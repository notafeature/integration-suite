import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../lib/api";

const TYPE_TONE = {
  rsvp_status: "var(--orient-deep)",
  reminder: "var(--amber-deep)",
  schedule_change: "var(--amber-deep)",
  new_rsvp: "var(--clay)",
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/notifications").then(({ data }) => { setItems(data.notifications); setLoading(false); });
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.post("/notifications/read-all"); load(); };
  const openOne = async (n) => { if (!n.read) { await api.post(`/notifications/${n.id}/read`); load(); } };

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="label text-orient-deep">What's changed</p>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 450 }}>Your field, updated.</h1>
        </div>
        {items.some((i) => !i.read) && (
          <button onClick={markAll} data-testid="mark-all-read" className="label text-ink-soft hover:text-clay">Mark all read</button>
        )}
      </div>

      {loading ? <p className="mt-12 text-ink-soft">Loading…</p> : items.length === 0 ? (
        <p className="mt-12 text-ink-soft" data-testid="no-notifications">Nothing yet. When a circle responds to you, it'll appear here.</p>
      ) : (
        <div className="mt-10 divide-y divide-line border-t border-line" data-testid="notifications-list">
          {items.map((n) => {
            const inner = (
              <div className={`flex gap-3 py-5 ${n.read ? "opacity-60" : ""}`} data-testid={`notification-${n.id}`}>
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_TONE[n.type] || "var(--orient)" }} />
                <div>
                  <p className="font-display text-lg" style={{ fontWeight: 460 }}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-soft/60">{(() => { try { return formatDistanceToNow(new Date(n.created_at), { addSuffix: true }); } catch { return ""; } })()}</p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => openOne(n)}>{inner}</Link>
            ) : (
              <div key={n.id} onClick={() => openOne(n)}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
