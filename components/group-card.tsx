import Link from "next/link";
import { FORMAT_LABELS, type Group } from "@/lib/data";

export function GroupCard({ group }: { group: Group }) {
  const next = group.meetings[0];
  return (
    <Link
      href={`/groups/${group.slug}`}
      className="group flex flex-col border border-ink/20 bg-paper-deep/40 p-6 transition-colors hover:border-clay hover:bg-paper-deep/70"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="label text-sage">{FORMAT_LABELS[group.format]}</span>
        <span className="label text-ink-soft">
          {group.city}, {group.state}
        </span>
      </div>
      <h3
        className="mt-4 text-2xl leading-snug transition-colors group-hover:text-clay"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        {group.name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {group.summary}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-ink/15 pt-4 text-xs text-ink-soft">
        <span>{group.cadence}</span>
        {next && (
          <span className="text-clay-deep">
            Next: {formatDate(next.date)}
          </span>
        )}
      </div>
    </Link>
  );
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
