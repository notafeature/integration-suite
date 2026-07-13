import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { WatercolorBand } from "./WatercolorBand";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import api from "../lib/api";

const nav = [
  { to: "/", label: "Field", end: true },
  { to: "/directory", label: "Directory" },
];

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={`nav-${label.toLowerCase()}`}
      className={({ isActive }) =>
        `label transition-colors ${isActive ? "text-ink" : "text-ink-soft hover:text-ink"}`
      }
    >
      {label}
    </NavLink>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    api.get("/notifications").then(({ data }) => setUnread(data.unread)).catch(() => {});
  }, [user, loc.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3.5 sm:px-8">
        <Link to="/" data-testid="brand-home" className="flex items-center">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => <NavItem key={n.to} {...n} />)}
          {user && <NavItem to="/organize" label="Organize" />}
          {user && <NavItem to="/connections" label="Connections" />}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {user ? (
            <>
              <Link to="/notifications" data-testid="nav-notifications" className="relative text-ink-soft hover:text-ink">
                <Bell size={18} strokeWidth={1.5} />
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-canvas" data-testid="unread-badge">
                    {unread}
                  </span>
                )}
              </Link>
              <span className="label text-ink-soft">{user.name?.split(" ")[0]}</span>
              <button onClick={logout} data-testid="logout-btn" className="label text-ink-soft hover:text-ink">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-signin" className="label text-ink-soft hover:text-ink">Sign in</Link>
              <Link to="/start" data-testid="nav-host" className="label border border-ink/25 px-4 py-2 transition-colors hover:border-ink hover:text-ink">
                Host a circle
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setOpen((v) => !v)} data-testid="menu-toggle" aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 py-4 md:hidden" data-testid="mobile-menu">
          <div className="flex flex-col gap-4">
            {nav.map((n) => <NavItem key={n.to} {...n} />)}
            {user ? (
              <>
                <NavItem to="/organize" label="Organize" />
                <NavItem to="/connections" label="Connections" />
                <NavItem to="/notifications" label="Notifications" />
                <button onClick={logout} className="label text-left text-ink-soft">Sign out</button>
              </>
            ) : (
              <>
                <NavItem to="/login" label="Sign in" />
                <NavItem to="/start" label="Host a circle" />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function ThemeToggle() {
  const [t, setT] = useState(document.documentElement.dataset.theme || "field");
  const set = (v) => { document.documentElement.dataset.theme = v; localStorage.setItem("cultivate_theme", v); setT(v); };
  return (
    <span className="label flex items-center gap-2" data-testid="theme-toggle">
      <span className="text-ink-soft/50">Palette</span>
      <button onClick={() => set("field")} data-testid="theme-field" className={t === "field" ? "text-ink" : "text-ink-soft/60 hover:text-ink"}>Field</button>
      <span className="text-ink-soft/30">/</span>
      <button onClick={() => set("warm")} data-testid="theme-warm" className={t === "warm" ? "text-ink" : "text-ink-soft/60 hover:text-ink"}>Warm</button>
    </span>
  );
}

export function Footer() {
  const { entity } = useConfig();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display italic">“We don't walk this path alone. We walk it together.”</p>
        <div className="flex flex-wrap items-center gap-5">
          <ThemeToggle />
          <Link to="/legal" className="hover:text-ink" data-testid="footer-legal">Boundaries</Link>
          <Link to="/directory" className="hover:text-ink">Directory</Link>
          <span className="text-ink-soft/70">{entity?.name}</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children, full = false }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className={full ? "flex-1" : "flex-1"}>{children}</main>
      <WatercolorBand />
      <Footer />
    </div>
  );
}
