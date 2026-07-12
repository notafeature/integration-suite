export const TEMPORAL = {
  imminent: { label: "Meeting soon", tone: "var(--amber-deep)", ring: "#9E6A2C" },
  soon: { label: "Meeting this week", tone: "var(--amber)", ring: "#C0894A" },
  scheduled: { label: "Upcoming", tone: "var(--orient)", ring: "#7C8AA0" },
};

export function temporalMeta(t) {
  return TEMPORAL[t] || null;
}
