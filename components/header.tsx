import Link from "next/link";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/groups", label: "Find a circle" },
  { href: "/start", label: "Start a circle" },
  { href: "/legal", label: "Our boundaries" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-ink transition-colors hover:text-clay">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-5 sm:gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label text-ink-soft transition-colors hover:text-clay"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
