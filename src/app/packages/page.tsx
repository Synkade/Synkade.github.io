import Link from "next/link";

interface PackageSummary {
  package_hash: string;
  pack_name: string;
  authors: string[];
  song_count: number;
  updated_at: string;
}

async function getPackages(): Promise<PackageSummary[]> {
  // En producción esto llama al Worker: `${process.env.API_BASE_URL}/api/packages`
  // Aquí se deja como arreglo vacío hasta que la API esté conectada.
  try {
    const base = process.env.API_BASE_URL;
    if (!base) return [];
    const res = await fetch(`${base}/api/packages`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Packages</h1>
        <Link
          href="/upload"
          style={{
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Upload package
        </Link>
      </div>

      {packages.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {packages.map((pkg) => (
            <Link
              key={pkg.package_hash}
              href={`/packages/${pkg.package_hash}`}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 16,
                textDecoration: "none",
                color: "var(--text)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>
                {pkg.pack_name}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {pkg.authors.join(", ")} · {pkg.song_count} songs
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 40,
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      <p>No packages have been published yet.</p>
      <p>
        <Link href="/upload" style={{ color: "var(--accent)" }}>
          Upload the first one
        </Link>
      </p>
    </div>
  );
}
