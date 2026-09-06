import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Upload a package</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Drop your <code>.bin</code> package file. If it matches one of your
        existing packages (by its internal key), it will be treated as an
        update.
      </p>
      <UploadForm />
    </div>
  );
}
