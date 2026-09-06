import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "3rem", marginBottom: 16 }}>
            Bring your own songs to the dance floor.
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              maxWidth: 520,
              marginBottom: 24,
            }}
          >
            A free, community-made dance game. No included songs — creators
            build charts from any choreography and share them as packages
            anyone can play, camera and all.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              href="/packages"
              style={{
                background: "var(--accent)",
                color: "var(--accent-contrast)",
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Browse packages
            </Link>
            <Link
              href="/docs"
              style={{
                border: "1px solid var(--border)",
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text)",
              }}
            >
              How to create a chart
            </Link>
          </div>
        </div>
        <Waveform />
      </section>

      <StatsStrip />

      <section>
        <SectionHeading title="Recent packages" href="/packages" />
        <PlaceholderGrid />
      </section>
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 20,
      }}
    >
      <h2 style={{ fontSize: "1.5rem" }}>{title}</h2>
      <Link href={href} style={{ color: "var(--accent)", textDecoration: "none" }}>
        View all →
      </Link>
    </div>
  );
}

function StatsStrip() {
  // TODO: reemplazar por datos reales via fetch a /api/stats
  const stats = [
    { label: "Packages", value: "—" },
    { label: "Songs", value: "—" },
    { label: "Players", value: "—" },
  ];
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
            {s.value}
          </div>
          <div style={{ color: "var(--text-muted)" }}>{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function PlaceholderGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 16,
            color: "var(--text-muted)",
          }}
        >
          No packages yet — be the first to upload one.
        </div>
      ))}
    </div>
  );
}

function Waveform() {
  return (
    <svg viewBox="0 0 300 160" width="100%" height="auto" aria-hidden>
      <polyline
        points="0,80 30,80 45,20 65,140 85,40 105,110 125,80 300,80"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="0,90 40,90 55,60 75,120 95,55 115,100 135,90 300,90"
        fill="none"
        stroke="var(--accent-alt)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
