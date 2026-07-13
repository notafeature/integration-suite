import React from "react";
import { CalendarPlus, Download } from "lucide-react";
import api, { BACKEND_URL } from "../lib/api";

/** Understated calendar actions — appear once a meeting is in context / approved. */
export function CalendarActions({ meetingId, compact = false }) {
  const openGoogle = async () => {
    try {
      const { data } = await api.get(`/meetings/${meetingId}/google`);
      window.open(data.url, "_blank", "noopener");
    } catch { /* ignore */ }
  };
  const downloadIcs = () => {
    window.open(`${BACKEND_URL}/api/meetings/${meetingId}/ics`, "_blank", "noopener");
  };
  return (
    <div className={`flex items-center gap-4 ${compact ? "text-xs" : "text-sm"} text-ink-soft`}>
      <button onClick={openGoogle} data-testid="add-google-cal" className="inline-flex items-center gap-1.5 hover:text-orient-deep">
        <CalendarPlus size={15} strokeWidth={1.5} /> Google Calendar
      </button>
      <button onClick={downloadIcs} data-testid="download-ics" className="inline-flex items-center gap-1.5 hover:text-orient-deep">
        <Download size={15} strokeWidth={1.5} /> Download .ics
      </button>
    </div>
  );
}
