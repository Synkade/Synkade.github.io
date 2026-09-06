interface SongIdRow {
  song_id: number;
  status: "free" | "reserved" | "used" | "conflict";
  detail: string;
}

async function getSongIds(): Promise<SongIdRow[]> {
  try {
    const base = process.env.API_BASE_URL;
    if (!base) return [];
    const res = await fetch(`${base}/api/song-ids`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

const STATUS_LABEL: Record<SongIdRow["status"], string> = {
  free: "Free",
  reserved: "Reserved",
  used: "Used",
  conflict: "⚠ Conflict",
};

const STATUS_COLOR: Record<SongIdRow["status"], string> = {
  free: "var(--text-muted)",
  reserved: "var(--accent-alt)",
  used: "var(--text)",
  conflict: "var(--danger)",
};

export default async function IdsPage() {
  const rows = await getSongIds();

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Song IDs registry</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Every song ID in the community, and whether it's free, reserved, in
        use, or in conflict between packages.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "10px 8px" }}>ID</th>
            <th style={{ padding: "10px 8px" }}>Status</th>
            <th style={{ padding: "10px 8px" }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: "24px 8px", color: "var(--text-muted)" }}>
                No data yet — connect this page to the API.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.song_id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 8px" }}>{row.song_id}</td>
                <td style={{ padding: "10px 8px", color: STATUS_COLOR[row.status] }}>
                  {STATUS_LABEL[row.status]}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--text-muted)" }}>
                  {row.detail}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
