import type { Metadata } from "next";
import { StartForm } from "@/components/start-form";

export const metadata: Metadata = {
  title: "Start a circle",
};

const display = { fontFamily: "var(--font-display)" } as const;

const EXPECTATIONS = [
  {
    title: "Integration only, no exceptions",
    body: "Your circle is for after the experience. Sourcing, referrals to facilitators, and journey logistics are off-limits in the room and in your group description. This is the one rule that removes a group immediately.",
  },
  {
    title: "You are a peer, and you say so",
    body: "Unless you hold a relevant license and choose to say otherwise, your circle is peer support — not therapy, not treatment. Every circle opens by naming that out loud.",
  },
  {
    title: "Confidentiality is the floor",
    body: "You set agreements at the first meeting and revisit them when new people join. We provide a tested starting set you can adapt.",
  },
  {
    title: "Know your exits",
    body: "Keep a short local referral list — crisis lines, sliding-scale therapists — for moments that are bigger than a circle. We help you build one.",
  },
];

export default function StartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="label text-sage">For hosts</p>
          <h1
            className="mt-4 text-5xl tracking-tight"
            style={{ ...display, fontWeight: 480 }}
          >
            Start a circle
          </h1>
          <p className="mt-6 max-w-lg leading-relaxed text-ink-soft">
            A circle needs a steady host more than it needs a perfect one. If
            you can hold a room, keep a confidence, and show up on schedule,
            you can do this — and we&apos;ll back you with formats, agreements,
            and scheduling tools.
          </p>

          <div className="mt-12 space-y-8">
            <p className="label text-sage">What hosting asks of you</p>
            {EXPECTATIONS.map((e, i) => (
              <div key={e.title} className="flex gap-5">
                <span className="text-clay" style={display}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-lg" style={{ ...display, fontWeight: 500 }}>
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {e.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit border border-ink/20 bg-paper-deep/40 p-8 lg:sticky lg:top-24">
          <p className="label text-sage">Tell us about your circle</p>
          <StartForm />
        </div>
      </div>
    </div>
  );
}
