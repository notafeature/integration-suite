"use client";

import { useState } from "react";
import { FORMAT_LABELS, type GroupFormat } from "@/lib/data";

/**
 * Host application stub — captures the intended fields, no backend yet.
 * Real version submits to a review queue (hosts are vetted before listing).
 */
export function StartForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mt-6 border border-sage bg-sage/10 p-6 text-sm leading-relaxed text-ink-soft">
        <p className="font-medium text-ink">Received (prototype).</p>
        <p className="mt-2">
          In the real flow, this goes to a review queue — every host has a
          short conversation with the platform team before their circle is
          listed. Nothing publishes automatically.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-ink/25 bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-clay";

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="name" className="label mb-2 block text-ink-soft">
          Circle name
        </label>
        <input id="name" required className={inputClass} placeholder="e.g. Riverbed Circle" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="label mb-2 block text-ink-soft">
            City
          </label>
          <input id="city" required className={inputClass} placeholder="Santa Fe" />
        </div>
        <div>
          <label htmlFor="format" className="label mb-2 block text-ink-soft">
            Format
          </label>
          <select id="format" className={inputClass} defaultValue="sharing-circle">
            {(Object.keys(FORMAT_LABELS) as GroupFormat[]).map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cadence" className="label mb-2 block text-ink-soft">
          How often would you meet?
        </label>
        <input id="cadence" required className={inputClass} placeholder="Twice monthly, Tuesday evenings" />
      </div>
      <div>
        <label htmlFor="experience" className="label mb-2 block text-ink-soft">
          Your experience holding space
        </label>
        <textarea
          id="experience"
          required
          rows={4}
          className={inputClass}
          placeholder="Groups you've facilitated, trainings, communities you've been part of…"
        />
      </div>
      <div>
        <label htmlFor="email" className="label mb-2 block text-ink-soft">
          Email
        </label>
        <input id="email" type="email" required className={inputClass} placeholder="you@example.com" />
      </div>
      <button
        type="submit"
        className="w-full cursor-pointer bg-clay px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-clay-deep"
      >
        Apply to host
      </button>
      <p className="text-xs leading-relaxed text-ink-soft">
        Every host is reviewed before a circle is listed. By applying you agree
        the circle will be integration-only and in person.
      </p>
    </form>
  );
}
