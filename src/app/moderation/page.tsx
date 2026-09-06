import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import { isModerator } from "@/lib/moderation";

export default async function ModerationDashboard() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (!session) {
    redirect("/login");
  }

  const allowed = await isModerator(session!.discordId);
  if (!allowed) {
    return <RestrictedAccess />;
  }

  // TODO: fetch(`${API_BASE_URL}/api/moderation/queue`)
  return (
    <div>
      <h1>Moderation queue</h1>
      <p style={{ color: "var(--text-muted)" }}>
        No pending score submissions to review yet.
      </p>
    </div>
  );
}

function RestrictedAccess() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--text-muted)",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Restricted access</h1>
      <p>You don&apos;t have permission to view this page.</p>
    </div>
  );
}
