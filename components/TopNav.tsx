import Link from "next/link";
import { ReactNode } from "react";

type TopNavProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/manual-entry", label: "Manual Entry" },
  { href: "/library", label: "Saved Materials" },
];

export function TopNav({ title, subtitle, actions }: TopNavProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-amber-100 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-amber-500">SpeechWhiz</p>
          {title ? <h1 className="text-lg font-semibold text-amber-950">{title}</h1> : null}
          {subtitle ? <p className="text-sm text-amber-800/80">{subtitle}</p> : null}
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
            >
              {link.label}
            </Link>
          ))}
          {actions}
        </nav>
      </div>
    </header>
  );
}
