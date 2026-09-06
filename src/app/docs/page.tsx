const SECTIONS = [
  {
    title: "How to play",
    body: "Camera requirements, controls, and how to install the game from GitHub Releases.",
  },
  {
    title: "Creating a chart (PLD)",
    body: "Using the pose editor to import a reference animation and place Static, Hold and PassBy events.",
  },
  {
    title: "Packaging a ROM",
    body: "Folder layout, metadata.txt fields, and how to compress everything into a .bin package.",
  },
  {
    title: "Video & audio formats",
    body: "LVF (video) and LAF (audio) — how to compress your song's video and audio for the game.",
  },
];

export default function DocsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Documentation</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
        Guides for creating and sharing content for the game.
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              background: "var(--surface)",
            }}
          >
            <h3 style={{ marginBottom: 6 }}>{s.title}</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
