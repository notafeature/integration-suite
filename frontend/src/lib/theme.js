export const TEMPORAL = {
  imminent: { label: "Meeting soon", tone: "var(--amber-deep)", ring: "var(--amber-deep)" },
  soon: { label: "Meeting this week", tone: "var(--amber)", ring: "var(--amber)" },
  scheduled: { label: "Upcoming", tone: "var(--orient)", ring: "var(--orient)" },
};

export function temporalMeta(t) {
  return TEMPORAL[t] || null;
}
