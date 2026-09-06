import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Theme } from "@/lib/theme";

const NAV_LINKS = [
  { href: "/packages", label: "Packages" },
  { href: "/ids", label: "IDs" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar({ theme }: { theme: Theme }) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <PulseMark />
          Dance Hub
        </Link>

        <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle initialTheme={theme} />
          <Link
            href="/login"
            style={{
              textDecoration: "none",
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Log in with Discord
          </Link>
        </nav>
      </div>
    </header>
  );
}

/** Pequeño motivo de onda/pulso, reutilizado como marca visual del sitio. */
function PulseMark() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <path
        d="M1 8H5L7.5 1L11.5 15L14.5 8H21"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
