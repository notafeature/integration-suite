import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Boundaries & legal",
};

const display = { fontFamily: "var(--font-display)" } as const;

const SECTIONS = [
  {
    heading: "Integration only",
    paras: [
      `${siteConfig.name} exists for one part of the psychedelic experience: what comes after. The platform, its hosts, and its groups do not provide, sell, source, gift, or facilitate access to any controlled substance, and do not connect members with people who do. Group descriptions, meetings, and member communications on the platform may not be used to arrange access of any kind.`,
      "This isn't a disclaimer bolted on for cover — it's the product boundary. Groups that drift toward facilitation are removed from the platform.",
    ],
  },
  {
    heading: "An independent platform",
    paras: [
      `${siteConfig.name} is operated by ${siteConfig.entity.name}. It is not owned by, operated by, or legally affiliated with any psychedelic society, church, or advocacy organization — including any organization whose members use the platform. Societies and community leaders may license the platform for their region; a license is a software agreement, not an affiliation, agency, or partnership.`,
      "Hosts are independent community members, not employees, agents, or representatives of the platform. Each circle is its own community, responsible for its own conduct.",
    ],
  },
  {
    heading: "Peer support, not care",
    paras: [
      "Circles on this platform are peer community, not group therapy, medical care, or crisis services. Hosts are not acting as clinicians on the platform even when they hold clinical credentials elsewhere. Nothing shared in a circle or on this site is medical, psychological, or legal advice.",
      "If you are in crisis, contact local emergency services or call or text 988 (Suicide & Crisis Lifeline, US). Hosts keep local referral lists and will point you toward professional support.",
    ],
  },
  {
    heading: "Privacy as a default",
    paras: [
      "Attendance at an integration circle is sensitive information. Exact meeting locations are shared host-to-member after a seat is confirmed, member lists are never public, and the platform collects the minimum it needs to run. A full privacy policy will accompany the first production release.",
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="label text-sage">Boundaries &amp; legal</p>
      <h1
        className="mt-4 text-5xl tracking-tight"
        style={{ ...display, fontWeight: 480 }}
      >
        The lines that make this possible
      </h1>
      <p className="mt-6 leading-relaxed text-ink-soft">
        Integration communities only work if everyone can trust the container.
        These boundaries are what let people show up openly — and what keeps
        the platform, its hosts, and the communities around it protected.
      </p>

      <div className="mt-14 space-y-12">
        {SECTIONS.map((s, i) => (
          <section key={s.heading} className="border-t border-ink/15 pt-8">
            <div className="flex items-baseline gap-4">
              <span className="text-sm text-clay" style={display}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-2xl" style={{ ...display, fontWeight: 500 }}>
                {s.heading}
              </h2>
            </div>
            <div className="mt-4 space-y-4 pl-9">
              {s.paras.map((p) => (
                <p key={p.slice(0, 32)} className="text-sm leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 border border-ink/20 bg-paper-deep/40 p-6 text-xs leading-relaxed text-ink-soft">
        This page describes intended platform policy and is placeholder text —
        not final legal language. Formal terms of use, privacy policy, and the
        licensing agreement should be drafted with counsel before launch.
      </p>
    </div>
  );
}
