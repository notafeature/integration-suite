import React from "react";
import { useConfig } from "../context/ConfigContext";

const SECTIONS = [
  {
    n: "01", title: "Integration only",
    body: "This platform exists for what comes after an experience. It does not provide, source, or facilitate access to any substance, and any group that drifts toward facilitation is removed. There are no exceptions to this.",
  },
  {
    n: "02", title: "Peer, not clinical",
    body: "Circles are community, not treatment. Hosts are trained peers, and every group states this plainly in its agreements. Crisis support belongs with professionals — hosts keep referral lists.",
  },
  {
    n: "03", title: "Independent by design",
    body: "The platform is operated by its own entity, deliberately unaffiliated with any psychedelic society or organization whose members may use it. Communities stay legally distinct from the platform and from each other.",
  },
  {
    n: "04", title: "In-person first",
    body: "The product's job is to get people into a real room. Online circles exist as a bridge for those without a local group, but the intention is real, human-scale gathering.",
  },
];

export default function Legal() {
  const { entity } = useConfig();
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="label text-orient-deep">Where we stand</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl" style={{ fontWeight: 460 }}>
        Boundaries we don't cross.
      </h1>
      <p className="mt-6 max-w-xl text-ink-soft">
        These are decisions, not decoration. They shape the product, the copy, and the communities we host.
      </p>
      <div className="mt-14 flex flex-col divide-y divide-line border-t border-line">
        {SECTIONS.map((s) => (
          <div key={s.n} className="grid gap-2 py-8 sm:grid-cols-[3rem_1fr]" data-testid={`legal-${s.n}`}>
            <span className="font-display text-clay">{s.n}</span>            <div>
              <h2 className="font-display text-2xl" style={{ fontWeight: 500 }}>{s.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink-soft">
        Questions about these boundaries? Reach the operating entity at{" "}
        <a href={`mailto:${entity?.email}`} className="text-clay-deep underline underline-offset-4">{entity?.email}</a>.
      </p>
    </div>
  );
}
