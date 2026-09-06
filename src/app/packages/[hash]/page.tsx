export default function PackageDetailPage({
  params,
}: {
  params: { hash: string };
}) {
  // TODO: fetch(`${API_BASE_URL}/api/packages/${params.hash}`)
  return (
    <div>
      <h1>Package</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Package hash: <code>{params.hash}</code>
      </p>
      <p style={{ color: "var(--text-muted)" }}>
        This page will show the package's songs, metadata, screenshots and
        download link once connected to the API.
      </p>
    </div>
  );
}
