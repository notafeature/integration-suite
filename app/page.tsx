import Link from "next/link";
import { GROUPS } from "@/lib/data";
import { GroupCard } from "@/components/group-card";
import { siteConfig } from "@/lib/site-config";

const display = { fontFamily: "var(--font-display)" } as const;

const STEPS = [
  {
    n: "01",
    title: "Find a circle",
    body: "Browse integration groups near you — sharing circles, walking groups, studio sessions, peer support. Every group lists its format, cadence, and agreements up front, so you know the room before you enter it.",
  },
  {
    n: "02",
    title: "Show up in person",
    body: "Request a seat and the host confirms the details. Meetings happen in real rooms — living rooms, studios, trailheads — not on video calls. The point is other people, at human scale.",
  },
  {
    n: "03",
    title: "Keep coming back",
    body: "Insight fades; community holds. Regular circles give the experience somewhere to land over weeks and months — which is where integration actually happens.",
  },
];

const COMMITMENTS = [
  {
    title: "Integration only",
    body: "This platform exists for what comes after an experience. It does not provide, source, or facilitate access to any substance, and groups that drift toward facilitation are removed.",
  },
  {
    title: "Peer, not clinical",
    body: "Circles are community, not treatment. Hosts are trained peers, and every group's agreements say so plainly. Crisis support belongs with professionals — hosts keep referral lists.",
  },
  {
    title: "Independent by design",
    body: `${siteConfig.name} is operated by its own entity, unaffiliated with any psychedelic society. Hosts and communities stay legally distinct from the platform — and from each other.`,
  },
];

export default function Home() {
  const featured = GROUPS.slice(0, 3);
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <p className="label text-clay-deep">
            {`${siteConfig.region.label} & growing`}
          </p>
          <h1
            className="mt-6 max-w-4xl text-5xl leading-[1.05] tracking-tight sm:text-7xl"
            style={{ ...display, fontWeight: 480 }}
          >
            The journey ends.
            <br />
            <em className="text-clay" style={{ fontWeight: 400 }}>
              The work begins together.
            </em>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            {`${siteConfig.name} helps people find — and start — in-person
            integration circles: small, steady groups for making sense of a
            psychedelic experience after it's over. No feeds, no streams.
            A room, some chairs, and people who get it.`}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/groups"
              className="bg-clay px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-deep"
            >
              Find a circle
            </Link>
            <Link
              href="/start"
              className="border border-ink/30 px-7 py-3.5 text-sm font-medium transition-colors hover:border-clay hover:text-clay"
            >
              Start one in your city
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <p className="label text-sage">How it works</p>
          <div className="mt-10 grid gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-paper p-8">
                <span className="text-sm text-clay" style={display}>
                  {step.n}
                </span>
                <h2
                  className="mt-3 text-2xl"
                  style={{ ...display, fontWeight: 500 }}
                >
                  {step.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured circles */}
      <section className="border-b border-ink/15 bg-paper-deep/30">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="label text-sage">Circles meeting now</p>
              <h2
                className="mt-3 text-4xl tracking-tight"
                style={{ ...display, fontWeight: 480 }}
              >
                Rooms already open
              </h2>
            </div>
            <Link href="/groups" className="label text-clay-deep hover:text-clay">
              All circles →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featured.map((group) => (
              <GroupCard key={group.slug} group={group} />
            ))}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <p className="label text-sage">Where we stand</p>
          <h2
            className="mt-3 max-w-2xl text-4xl tracking-tight"
            style={{ ...display, fontWeight: 480 }}
          >
            Three lines we don&apos;t cross
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {COMMITMENTS.map((c, i) => (
              <div key={c.title} className="border-t-2 border-clay pt-5">
                <span className="text-sm text-ink-soft" style={display}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl" style={{ ...display, fontWeight: 500 }}>
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-ink-soft">
            The fine print matters here.{" "}
            <Link href="/legal" className="text-clay-deep underline underline-offset-4 hover:text-clay">
              Read our boundaries in full
            </Link>
            .
          </p>
        </div>
      </section>

      {/* For hosts / licensing */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="label text-paper/50">For circle-keepers</p>
              <h2
                className="mt-4 text-4xl leading-tight tracking-tight sm:text-5xl"
                style={{ ...display, fontWeight: 480 }}
              >
                Already holding space?
                <br />
                <em className="text-paper/70" style={{ fontWeight: 400 }}>
                  Put your circle on the map.
                </em>
              </h2>
            </div>
            <div className="flex flex-col justify-center gap-6">
              <p className="leading-relaxed text-paper/70">
                Hosts get a group page, meeting scheduling, seat requests, and
                a set of tested community agreements to start from. If you lead
                an integration community in another region, the whole platform
                can run under your banner — get in touch about licensing.
              </p>
              <div>
                <Link
                  href="/start"
                  className="inline-block bg-paper px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                >
                  Start a circle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
