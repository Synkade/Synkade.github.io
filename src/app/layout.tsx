import type { Metadata } from "next";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Dance Hub",
  description:
    "Community hub for free dance-game charts, packages and leaderboards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nota: en Next.js sobre Cloudflare Pages, headers() da acceso a la
  // cabecera "cookie" cruda de la request en un Server Component.
  const cookieHeader = headers().get("cookie");
  const theme = readThemeFromCookieHeader(cookieHeader);

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <Navbar theme={theme} />
        <main className="container" style={{ minHeight: "70vh", paddingTop: 40 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
