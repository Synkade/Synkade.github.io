export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "var(--space-6)",
        padding: "var(--space-4) 0",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span>&copy; {new Date().getFullYear()} Dance Hub — free & open source</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#" style={{ textDecoration: "none" }}>
            GitHub
          </a>
          <a href="#" style={{ textDecoration: "none" }}>
            Discord
          </a>
          <a href="#" style={{ textDecoration: "none" }}>
            Ko-fi
          </a>
          <a href="/docs" style={{ textDecoration: "none" }}>
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
