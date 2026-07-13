/**
 * White-label configuration.
 *
 * The platform is designed to be licensed to integration community leaders
 * in other regions. Everything brand- or region-specific lives here so a
 * licensee deployment only needs to swap this file (or, later, load it
 * from a tenant record).
 *
 * Note: the platform brand is intentionally NOT the name of any psychedelic
 * society. Keeping the operating entity and the platform separate from the
 * society is a core legal requirement of the project.
 */

export const siteConfig = {
  /** Platform brand — independent of any society or organization. */
  name: "Cairn",
  tagline: "Community for the road back down.",

  /** Home region for this deployment. */
  region: {
    label: "Northern New Mexico",
    defaultCity: "Santa Fe",
  },

  /**
   * Operating entity shown in legal text. Placeholder until the entity is
   * formed — must remain distinct from the society itself.
   */
  entity: {
    name: "Cairn Platform, LLC (formation pending)",
    contactEmail: "hello@example.com",
  },

  /** Hard product boundaries, surfaced in copy and legal pages. */
  boundaries: {
    integrationOnly: true, // post-journey support only; never access or sourcing
    inPersonFirst: true, // the product's job is to get people into a room
    peerNotClinical: true, // community support, not therapy or medical care
  },
} as const;

export type SiteConfig = typeof siteConfig;
