import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export default async function ProfilePage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>My profile</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Logged in as <strong>{session!.username}</strong>
      </p>
      <p style={{ color: "var(--text-muted)" }}>
        TODO: uploaded packages, reserved IDs (quota used / 20), version
        history — once connected to the API.
      </p>
    </div>
  );
}
