import type { Metadata } from "next";
import Link from "next/link";
import {
  FORMAT_LABELS,
  GROUPS,
  getCities,
  type GroupFormat,
} from "@/lib/data";
import { GroupCard } from "@/components/group-card";

export const metadata: Metadata = {
  title: "Find a circle",
};

const display = { fontFamily: "var(--font-display)" } as const;

function filterHref(city?: string, format?: string): string {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (format) params.set("format", format);
  const qs = params.toString();
  return qs ? `/groups?${qs}` : "/groups";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-clay bg-clay text-paper"
          : "border-ink/25 text-ink-soft hover:border-clay hover:text-clay"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; format?: string }>;
}) {
  const { city, format } = await searchParams;
  const groups = GROUPS.filter(
    (g) =>
      (!city || g.city === city) && (!format || g.format === format)
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="label text-sage">Directory</p>
      <h1
        className="mt-4 text-5xl tracking-tight"
        style={{ ...display, fontWeight: 480 }}
      >
        Find a circle
      </h1>
      <p className="mt-5 max-w-xl leading-relaxed text-ink-soft">
        Every group here meets in person and is integration-only. Formats and
        agreements are listed up front — pick the kind of room that fits how
        you process.
      </p>

      <div className="mt-10 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-2 text-ink-soft">City</span>
          <FilterChip href={filterHref(undefined, format)} active={!city}>
            All
          </FilterChip>
          {getCities().map((c) => (
            <FilterChip key={c} href={filterHref(c, format)} active={city === c}>
              {c}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-2 text-ink-soft">Format</span>
          <FilterChip href={filterHref(city, undefined)} active={!format}>
            All
          </FilterChip>
          {(Object.keys(FORMAT_LABELS) as GroupFormat[]).map((f) => (
            <FilterChip key={f} href={filterHref(city, f)} active={format === f}>
              {FORMAT_LABELS[f]}
            </FilterChip>
          ))}
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.slug} group={group} />
          ))}
        </div>
      ) : (
        <div className="mt-12 border border-dashed border-ink/25 p-12 text-center">
          <p className="text-lg" style={display}>
            No circles match that yet.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Maybe that&apos;s your cue —{" "}
            <Link href="/start" className="text-clay-deep underline underline-offset-4">
              start one
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
