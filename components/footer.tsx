import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer className="border-t border-ink/15 bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-4">
            <Wordmark className="text-paper" />
            <p className="text-sm leading-relaxed text-paper/70">
              {`${siteConfig.tagline} In-person integration circles for the time
              after a psychedelic experience.`}
            </p>
          </div>
          <nav className="flex flex-col gap-3">
            <span className="label text-paper/50">Platform</span>
            <Link href="/groups" className="text-sm text-paper/80 hover:text-paper">
              Find a circle
            </Link>
            <Link href="/start" className="text-sm text-paper/80 hover:text-paper">
              Start a circle
            </Link>
            <Link href="/legal" className="text-sm text-paper/80 hover:text-paper">
              Boundaries &amp; legal
            </Link>
          </nav>
        </div>
        <div className="mt-12 border-t border-paper/15 pt-6 text-xs leading-relaxed text-paper/50">
          <p>
            {`${siteConfig.name} is an integration-only community platform. It does
            not provide, source, or facilitate access to any substance, and it
            is not therapy or medical care. ${siteConfig.name} is operated by
            ${siteConfig.entity.name}, an independent entity unaffiliated with
            any psychedelic society or church.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
