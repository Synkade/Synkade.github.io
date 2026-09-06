"use client";

import { useState } from "react";

interface UploadWarning {
  song_id: number;
  type: "conflict" | "reserved_by_other";
  detail: string;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "warnings" | "done" | "error"
  >("idle");
  const [warnings, setWarnings] = useState<UploadWarning[]>([]);
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("package", file);

    try {
      const res = await fetch("/api/packages/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.status === 409 && data.warnings) {
        setWarnings(data.warnings);
        setStatus("warnings");
      } else if (res.ok) {
        setStatus("done");
        setMessage(data.message ?? "Package published.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Upload failed.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error while uploading.");
    }
  }

  async function confirmAnyway() {
    if (!file) return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("package", file);
    formData.append("confirm", "true");

    const res = await fetch("/api/packages/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("done");
      setMessage(data.message ?? "Package published.");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Upload failed.");
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".bin"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ marginBottom: 16, display: "block" }}
        />
        <button
          type="submit"
          disabled={!file || status === "uploading"}
          style={{
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </form>

      {status === "warnings" && (
        <div
          style={{
            marginTop: 20,
            border: `1px solid var(--danger)`,
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Some song IDs have conflicts:
          </p>
          <ul>
            {warnings.map((w) => (
              <li key={w.song_id}>
                #{w.song_id} — {w.detail}
              </li>
            ))}
          </ul>
          <button
            onClick={confirmAnyway}
            style={{
              marginTop: 8,
              background: "var(--danger)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Upload anyway
          </button>
        </div>
      )}

      {(status === "done" || status === "error") && (
        <p
          style={{
            marginTop: 16,
            color: status === "done" ? "var(--accent-alt)" : "var(--danger)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
