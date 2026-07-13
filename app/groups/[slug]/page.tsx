import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FORMAT_LABELS, GROUPS, getGroup } from "@/lib/data";
import { formatDate } from "@/components/group-card";
import { RequestSeatButton } from "@/components/request-seat-button";

const display = { fontFamily: "var(--font-display)" } as const;

export function generateStaticParams() {
  return GROUPS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const group = getGroup((await params).slug);
  return { title: group ? group.name : "Circle not found" };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const group = getGroup((await params).slug);
  if (!group) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <Link href="/groups" className="label text-ink-soft hover:text-clay">
        ← All circles
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="label text-sage">{FORMAT_LABELS[group.format]}</span>
            <span className="text-ink/30">·</span>
            <span className="label text-ink-soft">
              {group.city}, {group.state}
            </span>
            <span className="text-ink/30">·</span>
            <span className="label text-ink-soft">Est. {group.established}</span>
          </div>
          <h1
            className="mt-4 text-5xl tracking-tight sm:text-6xl"
            style={{ ...display, fontWeight: 480 }}
          >
            {group.name}
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            {`${group.cadence} · Up to ${group.capacity} people`}
          </p>

          <div className="mt-8 max-w-prose space-y-5">
            {group.description.map((para) => (
              <p key={para.slice(0, 32)} className="leading-relaxed text-ink-soft">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 border border-ink/20 bg-paper-deep/40 p-6">
            <p className="label text-sage">Held by</p>
            <p className="mt-3 text-xl" style={{ ...display, fontWeight: 500 }}>
              {group.host.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {group.host.note}
            </p>
          </div>

          <div className="mt-12">
            <p className="label text-sage">Circle agreements</p>
            <ul className="mt-5 space-y-3">
              {group.agreements.map((a, i) => (
                <li key={a} className="flex gap-4 border-b border-ink/10 pb-3 text-sm">
                  <span className="text-clay" style={display}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-ink-soft">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meetings rail */}
        <aside className="h-fit border border-ink/20 lg:sticky lg:top-24">
          <div className="border-b border-ink/20 bg-ink px-6 py-4">
            <p className="label text-paper/70">Upcoming meetings</p>
          </div>
          <div className="divide-y divide-ink/15">
            {group.meetings.map((m) => (
              <div key={m.id} className="p-6">
                <p className="text-2xl" style={{ ...display, fontWeight: 500 }}>
                  {formatDate(m.date)}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{m.time}</p>
                <p className="mt-1 text-sm text-ink-soft">{m.generalLocation}</p>
                <p className="mt-3 text-xs text-clay-deep">
                  {`${m.seatsLeft} ${m.seatsLeft === 1 ? "seat" : "seats"} left`}
                </p>
                <RequestSeatButton meetingId={m.id} />
              </div>
            ))}
          </div>
          <p className="border-t border-ink/15 p-6 text-xs leading-relaxed text-ink-soft">
            Exact addresses are shared by the host after your seat is
            confirmed. All meetings are in person and integration-only.
          </p>
        </aside>
      </div>
    </div>
  );
}
