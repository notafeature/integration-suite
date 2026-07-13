"use client";

import { useState } from "react";

/**
 * RSVP stub. Real flow (auth + host approval + notifications) comes with the
 * backend; for now this just confirms the interaction shape.
 */
export function RequestSeatButton({ meetingId }: { meetingId: string }) {
  const [requested, setRequested] = useState(false);

  if (requested) {
    return (
      <p className="mt-4 border border-sage bg-sage/10 px-4 py-2.5 text-xs text-sage">
        Request noted (prototype) — the host would confirm by email.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRequested(true)}
      data-meeting={meetingId}
      className="mt-4 w-full cursor-pointer bg-clay px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-clay-deep"
    >
      Request a seat
    </button>
  );
}
