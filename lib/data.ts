/**
 * Placeholder data layer.
 *
 * Shapes here are the intended database schema in miniature. Everything is
 * static for now; swap for a real datastore (and real geosearch) once the
 * product direction settles.
 */

export type GroupFormat =
  | "sharing-circle"
  | "peer-support"
  | "somatic"
  | "art-making"
  | "walking";

export const FORMAT_LABELS: Record<GroupFormat, string> = {
  "sharing-circle": "Sharing circle",
  "peer-support": "Peer support",
  somatic: "Somatic practice",
  "art-making": "Art-making",
  walking: "Walking group",
};

export interface Meeting {
  id: string;
  /** ISO date, meetings are always in-person */
  date: string;
  time: string;
  /** Deliberately vague until RSVP is confirmed — hosts share exact locations directly. */
  generalLocation: string;
  seatsLeft: number;
}

export interface Group {
  slug: string;
  name: string;
  city: string;
  state: string;
  format: GroupFormat;
  cadence: string;
  capacity: number;
  established: string;
  summary: string;
  description: string[];
  host: {
    name: string;
    note: string;
  };
  agreements: string[];
  meetings: Meeting[];
}

export const GROUPS: Group[] = [
  {
    slug: "riverbed-circle",
    name: "Riverbed Circle",
    city: "Santa Fe",
    state: "NM",
    format: "sharing-circle",
    cadence: "Twice monthly · Tuesday evenings",
    capacity: 12,
    established: "2024",
    summary:
      "A candlelit sharing circle for people making sense of recent journeys. Structured rounds, no crosstalk, strong confidentiality culture.",
    description: [
      "Riverbed is the longest-running circle on the platform. Each meeting opens with ten minutes of quiet, then two structured rounds of speaking — one for what happened, one for what it's asking of you now.",
      "The circle is format-strict on purpose: no advice, no interpretation of anyone else's experience, no crosstalk. People consistently say the discipline is what makes it safe.",
    ],
    host: {
      name: "Marisol V.",
      note: "Hospice worker and longtime circle-keeper. Trained in restorative-justice facilitation.",
    },
    agreements: [
      "What's shared in the circle stays in the circle.",
      "Speak from your own experience; no advising or interpreting for others.",
      "Arrive sober. This is integration space, not journey space.",
      "No sourcing, referrals, or facilitation talk — ever.",
    ],
    meetings: [
      {
        id: "riverbed-2026-07-21",
        date: "2026-07-21",
        time: "7:00–9:00 PM",
        generalLocation: "Railyard district, Santa Fe",
        seatsLeft: 3,
      },
      {
        id: "riverbed-2026-08-04",
        date: "2026-08-04",
        time: "7:00–9:00 PM",
        generalLocation: "Railyard district, Santa Fe",
        seatsLeft: 9,
      },
    ],
  },
  {
    slug: "high-desert-walkers",
    name: "High Desert Walkers",
    city: "Santa Fe",
    state: "NM",
    format: "walking",
    cadence: "Weekly · Saturday mornings",
    capacity: 10,
    established: "2025",
    summary:
      "Integration on foot. A slow shared walk in the foothills, paired conversation, and coffee after for anyone who wants to keep talking.",
    description: [
      "Some things are easier to say shoulder-to-shoulder than face-to-face. The Walkers meet at a trailhead, walk slowly for about ninety minutes in rotating pairs, and finish with optional coffee in town.",
      "Good fit for people who find seated circles intense, or who process better in motion.",
    ],
    host: {
      name: "Deshawn R.",
      note: "Former wilderness-therapy guide. Keeps the pace gentle and the pairs rotating.",
    },
    agreements: [
      "Your walking partner's story is theirs, not yours to retell.",
      "Anyone can walk in silence — just say so at the trailhead.",
      "Stay with the group; this is a social walk, not a hike.",
    ],
    meetings: [
      {
        id: "walkers-2026-07-18",
        date: "2026-07-18",
        time: "8:00–10:00 AM",
        generalLocation: "Dale Ball trails, Santa Fe foothills",
        seatsLeft: 4,
      },
    ],
  },
  {
    slug: "clay-and-ash",
    name: "Clay & Ash",
    city: "Santa Fe",
    state: "NM",
    format: "art-making",
    cadence: "Monthly · First Sunday",
    capacity: 8,
    established: "2025",
    summary:
      "A studio session for working with what words can't reach — clay, ink, charcoal. No art experience needed, no critique, ever.",
    description: [
      "Clay & Ash meets in a working ceramics studio. Each session starts with a short prompt drawn from the group, then two hours of quiet making. Sharing at the end is invited, never required.",
      "The point isn't the object. It's giving the experience a shape your hands can hold.",
    ],
    host: {
      name: "June K.",
      note: "Studio potter. Runs the space, fires anything you want to keep.",
    },
    agreements: [
      "No critique — of your own work included.",
      "Silence during making time.",
      "Take your piece home or leave it for the kiln; both are fine.",
    ],
    meetings: [
      {
        id: "clay-2026-08-02",
        date: "2026-08-02",
        time: "1:00–4:00 PM",
        generalLocation: "Baca Street studios, Santa Fe",
        seatsLeft: 2,
      },
    ],
  },
  {
    slug: "sandia-peer-circle",
    name: "Sandia Peer Circle",
    city: "Albuquerque",
    state: "NM",
    format: "peer-support",
    cadence: "Weekly · Thursday evenings",
    capacity: 14,
    established: "2025",
    summary:
      "A drop-in-friendly peer support group with a rotating facilitator bench. Practical, plain-spoken, and consistent — same room every week.",
    description: [
      "Sandia runs on consistency: same room, same time, every week. The facilitation rotates among four trained peers so the group never depends on one person.",
      "Discussion is topical — sleep, relationships, meaning, the fade of insights over time — with open floor in the second hour.",
    ],
    host: {
      name: "The Sandia bench",
      note: "Four rotating peer facilitators, each with 50+ hours of peer-support training.",
    },
    agreements: [
      "Confidentiality, always.",
      "Peer support is not therapy; we say so out loud at every meeting.",
      "Crisis needs go to professionals — facilitators keep a referral list.",
    ],
    meetings: [
      {
        id: "sandia-2026-07-16",
        date: "2026-07-16",
        time: "6:30–8:30 PM",
        generalLocation: "Nob Hill, Albuquerque",
        seatsLeft: 6,
      },
      {
        id: "sandia-2026-07-23",
        date: "2026-07-23",
        time: "6:30–8:30 PM",
        generalLocation: "Nob Hill, Albuquerque",
        seatsLeft: 8,
      },
    ],
  },
  {
    slug: "rio-grande-somatics",
    name: "Rio Grande Somatics",
    city: "Taos",
    state: "NM",
    format: "somatic",
    cadence: "Twice monthly · Sunday mornings",
    capacity: 10,
    established: "2026",
    summary:
      "Body-first integration: breath, grounding, and slow movement for experiences that live below language.",
    description: [
      "Some experiences settle in the body long before the mind catches up. This group works with breath, orientation, and slow movement practices drawn from trauma-aware somatic work.",
      "Sessions end with tea and unstructured time — many people say that's where the real conversation happens.",
    ],
    host: {
      name: "Ana Lucia P.",
      note: "Somatic practitioner, 500-hour certification. Clear about the line between this work and therapy.",
    },
    agreements: [
      "Everything is invitational — opt out of any practice, no explanation needed.",
      "No touch without explicit, per-session consent.",
      "This is community practice, not treatment.",
    ],
    meetings: [
      {
        id: "rio-2026-07-19",
        date: "2026-07-19",
        time: "9:00–11:00 AM",
        generalLocation: "Near Taos Plaza",
        seatsLeft: 5,
      },
    ],
  },
];

export function getGroup(slug: string): Group | undefined {
  return GROUPS.find((g) => g.slug === slug);
}

export function getCities(): string[] {
  return [...new Set(GROUPS.map((g) => g.city))];
}
